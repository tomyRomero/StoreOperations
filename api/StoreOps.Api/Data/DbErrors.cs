using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace StoreOps.Api.Data;

// SQL Server's answer when a constraint stops a save. The constraints are the last line of defence;
// services check first so the usual case gets a friendly message.
public static class DbErrors
{
    // A unique index refused a duplicate (2601, 2627)
    public static bool IsUniqueViolation(this DbUpdateException error) =>
        error.InnerException is SqlException { Number: 2601 or 2627 };

    // A foreign key refused the change, such as deleting a category that still has products (547)
    public static bool IsForeignKeyViolation(this DbUpdateException error) =>
        error.InnerException is SqlException { Number: 547 };
}
