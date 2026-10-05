namespace StoreOps.Api.Domain;

// Set automatically when a row is saved (see Data/TimestampInterceptor.cs). All times are UTC.
public interface ICreatedAt
{
    DateTime CreatedAtUtc { get; set; }
}

public interface IUpdatedAt
{
    DateTime UpdatedAtUtc { get; set; }
}
