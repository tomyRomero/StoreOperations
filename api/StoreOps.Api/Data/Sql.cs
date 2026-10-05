namespace StoreOps.Api.Data;

// Small helpers for writing CHECK constraints
internal static class Sql
{
    // "[Status] IN ('Pending', 'Shipped', ...)", built from the enum so the two can't drift apart
    public static string InEnum<TEnum>(string column) where TEnum : struct, Enum =>
        $"[{column}] IN ({string.Join(", ", Enum.GetNames<TEnum>().Select(name => $"'{name}'"))})";
}
