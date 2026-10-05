using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace StoreOps.Api.Data;

// Every DateTime column holds UTC. Values read back are marked as UTC (so JSON gets a trailing "Z"),
// and writing a local or unspecified time fails loudly instead of silently storing the wrong moment.
public class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
    value => RequireUtc(value),
    value => DateTime.SpecifyKind(value, DateTimeKind.Utc))
{
    private static DateTime RequireUtc(DateTime value) =>
        value.Kind == DateTimeKind.Utc
            ? value
            : throw new InvalidOperationException($"Expected a UTC time but got DateTimeKind.{value.Kind}.");
}
