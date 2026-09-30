using Microsoft.AspNetCore.Identity;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Auth;

// Who is an admin is decided on the server, never from the dashboard, so a stolen admin session
// can't create more admins:
//   dotnet run --project StoreOps.Api -- make-admin someone@example.com
//   dotnet run --project StoreOps.Api -- remove-admin someone@example.com
// The change reaches the account's open sessions at their next check against the database.
public static class AdminCommands
{
    public const string MakeAdmin = "make-admin";
    public const string RemoveAdmin = "remove-admin";

    // Returns the process exit code: 0 when the account ends up as asked, 1 when it can't
    public static async Task<int> RunAsync(IServiceProvider services, string command, string email, TextWriter output)
    {
        var grant = command switch
        {
            MakeAdmin => true,
            RemoveAdmin => false,
            _ => throw new ArgumentOutOfRangeException(nameof(command), command, "Expected make-admin or remove-admin."),
        };

        await using var scope = services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var clock = scope.ServiceProvider.GetRequiredService<TimeProvider>();

        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            output.WriteLine($"No account uses {email}. Sign up first, then run this again.");
            return 1;
        }

        if (await users.IsInRoleAsync(user, Roles.Admin) == grant)
        {
            output.WriteLine(grant ? $"{user.UserName} is already an admin." : $"{user.UserName} isn't an admin.");
            return 0;
        }

        // No actor: it was done on the server, not by an admin in the dashboard
        db.ActivityLog.Add(new ActivityLogEntry
        {
            Action = grant ? ActivityAction.AdminRoleGranted : ActivityAction.AdminRoleRemoved,
            EntityType = ActivityEntity.User,
            EntityId = user.Id,
            OccurredAtUtc = clock.GetUtcNow().UtcDateTime,
        });

        // Identity saves through the same database context, so the role and the activity entry are saved together
        var result = grant
            ? await users.AddToRoleAsync(user, Roles.Admin)
            : await users.RemoveFromRoleAsync(user, Roles.Admin);
        if (!result.Succeeded)
        {
            output.WriteLine($"Couldn't change {user.UserName}: {string.Join(" ", result.Errors.Select(e => e.Description))}");
            return 1;
        }

        output.WriteLine(grant ? $"{user.UserName} is now an admin." : $"{user.UserName} is no longer an admin.");
        return 0;
    }
}
