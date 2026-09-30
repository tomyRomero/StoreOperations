using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;

namespace StoreOps.Api.Auth.Services;

public sealed class LoginThrottleOptions
{
    public int AttemptThreshold { get; set; } = 5;
    public TimeSpan AttemptWindow { get; set; } = TimeSpan.FromMinutes(15);
    public TimeSpan LockoutDuration { get; set; } = TimeSpan.FromMinutes(15);
}

// Per-account protection against password guessing, the complement to the per-IP rate limiter:
// a credential-stuffing attack spread over many IPs still hits the same account. Failures are
// counted per email address whether or not an account exists, so the lockout can't be used to
// find out which emails are registered.
//
// The window is fixed from the first failure, not sliding, so one guess every few minutes can't
// keep a window alive forever. State lives in IDistributedCache (in memory for a single API
// instance; Redis or SQL Server when running several). Keys hold a hash, never the email itself.
public sealed class LoginThrottle(IDistributedCache cache, TimeProvider clock, IOptions<LoginThrottleOptions> options)
{
    private readonly LoginThrottleOptions _options = options.Value;

    public async Task<DateTimeOffset?> LockedUntilAsync(string email, CancellationToken ct)
    {
        var lockedUntil = ReadTime(await cache.GetStringAsync(LockKey(email), ct));
        return lockedUntil > clock.GetUtcNow() ? lockedUntil : null;
    }

    // Returns when the lock ends if this failure locked the account
    public async Task<DateTimeOffset?> RecordFailureAsync(string email, CancellationToken ct)
    {
        var now = clock.GetUtcNow();
        var (count, windowEnds) = ReadAttempts(await cache.GetStringAsync(AttemptsKey(email), ct));
        if (windowEnds <= now)
            (count, windowEnds) = (0, now + _options.AttemptWindow);

        count++;
        if (count < _options.AttemptThreshold)
        {
            await cache.SetStringAsync(AttemptsKey(email), $"{count}|{windowEnds.UtcTicks}",
                new DistributedCacheEntryOptions { AbsoluteExpiration = windowEnds }, ct);
            return null;
        }

        var lockedUntil = now + _options.LockoutDuration;
        await cache.SetStringAsync(LockKey(email), lockedUntil.UtcTicks.ToString(CultureInfo.InvariantCulture),
            new DistributedCacheEntryOptions { AbsoluteExpiration = lockedUntil }, ct);
        await cache.RemoveAsync(AttemptsKey(email), ct);
        return lockedUntil;
    }

    // After a successful sign-in, so someone who finally remembers their password starts from zero
    public Task ClearAsync(string email, CancellationToken ct) => cache.RemoveAsync(AttemptsKey(email), ct);

    private static string AttemptsKey(string email) => $"login-throttle:attempts:{Hash(email)}";

    private static string LockKey(string email) => $"login-throttle:locked:{Hash(email)}";

    private static string Hash(string email) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(email.Trim().ToUpperInvariant())));

    private static (int Count, DateTimeOffset WindowEnds) ReadAttempts(string? value)
    {
        var parts = value?.Split('|');
        return parts is [var count, var ticks]
            ? (int.Parse(count, CultureInfo.InvariantCulture), ReadTime(ticks))
            : (0, DateTimeOffset.MinValue);
    }

    private static DateTimeOffset ReadTime(string? ticks) =>
        ticks is null ? DateTimeOffset.MinValue : new DateTimeOffset(long.Parse(ticks, CultureInfo.InvariantCulture), TimeSpan.Zero);
}
