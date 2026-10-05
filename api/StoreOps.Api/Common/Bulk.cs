using StoreOps.Api.Data;

namespace StoreOps.Api.Common;

public sealed record BulkFailure<TKey>(TKey Id, string Code, string Message);

// What happened to each item of a bulk action: the ones that worked, and why the others didn't
public sealed record BulkResult<TKey>(IReadOnlyList<TKey> Succeeded, IReadOnlyList<BulkFailure<TKey>> Failed);

public static class Bulk
{
    // A bulk action is the single-item action repeated, each with its own save, so one item that
    // can't change (already cancelled, edited by someone else) doesn't stop the rest. The change
    // tracker is cleared between items, so nothing a refused item left behind is saved with the next.
    public static async Task<BulkResult<TKey>> RunAsync<TKey>(
        AppDbContext db, IEnumerable<TKey> ids, Func<TKey, Task<ApiError?>> action)
    {
        var succeeded = new List<TKey>();
        var failed = new List<BulkFailure<TKey>>();
        foreach (var id in ids.Distinct())
        {
            db.ChangeTracker.Clear();
            if (await action(id) is { } error)
                failed.Add(new BulkFailure<TKey>(id, error.Code, error.Message));
            else
                succeeded.Add(id);
        }

        db.ChangeTracker.Clear();
        return new BulkResult<TKey>(succeeded, failed);
    }
}
