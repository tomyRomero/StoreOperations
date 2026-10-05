namespace StoreOps.Api.Domain;

public class Category : ICreatedAt
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string ImageKey { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public List<Product> Products { get; set; } = [];
}
