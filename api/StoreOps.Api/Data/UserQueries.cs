using StoreOps.Api.Domain;

namespace StoreOps.Api.Data;

public static class UserQueries
{
    private static readonly string AdminRoleName = Roles.Admin.ToUpperInvariant();

    // The ids of admin accounts, as a subquery EF folds into the query that uses it
    public static IQueryable<int> AdminUserIds(this AppDbContext db) =>
        from userRole in db.UserRoles
        join role in db.Roles on userRole.RoleId equals role.Id
        where role.NormalizedName == AdminRoleName
        select userRole.UserId;
}
