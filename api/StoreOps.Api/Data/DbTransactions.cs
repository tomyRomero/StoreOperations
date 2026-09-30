using Microsoft.EntityFrameworkCore;

namespace StoreOps.Api.Data;

public static class DbTransactions
{
    // Runs work as one transaction that the retrying connection can repeat from the start.
    // The work must add its own entities: tracked changes are cleared before each attempt.
    public static Task<T> InTransactionAsync<T>(this AppDbContext db, Func<Task<T>> work, CancellationToken ct) =>
        db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            db.ChangeTracker.Clear();
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            var result = await work();
            await transaction.CommitAsync(ct);
            return result;
        });
}
