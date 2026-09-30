namespace StoreOps.Api.Domain;

// One entry in a customer's address book
public class UserAddress : ICreatedAt
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public required PostalAddress Address { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
