using Microsoft.Extensions.Options;

namespace StoreOps.Api.Emails;

// Checks the outbox every few seconds. One instance of the API runs it; a second instance would
// need a claim on each row before sending.
public sealed class EmailOutboxWorker(
    IServiceScopeFactory scopes, IOptions<EmailOptions> options, ILogger<EmailOutboxWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.Value.SendInBackground)
            return;

        using var timer = new PeriodicTimer(options.Value.PollInterval);
        do
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                await scope.ServiceProvider.GetRequiredService<EmailOutboxSender>().SendDueAsync(stoppingToken);
            }
            catch (Exception error) when (!stoppingToken.IsCancellationRequested)
            {
                logger.LogError(error, "Sending queued emails failed; trying again shortly");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
