using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data;

// Fills CreatedAtUtc and UpdatedAtUtc on save, from an injectable clock so tests can control time
public class TimestampInterceptor(TimeProvider clock) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        Stamp(eventData.Context);
        return result;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        Stamp(eventData.Context);
        return ValueTask.FromResult(result);
    }

    private void Stamp(DbContext? context)
    {
        if (context is null) return;

        var now = clock.GetUtcNow().UtcDateTime;
        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added && entry.Entity is ICreatedAt created)
                created.CreatedAtUtc = now;

            if (entry.State is EntityState.Added or EntityState.Modified && entry.Entity is IUpdatedAt updated)
                updated.UpdatedAtUtc = now;
        }
    }
}
