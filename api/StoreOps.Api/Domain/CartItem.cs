namespace StoreOps.Api.Domain;

// A line in a signed-in customer's cart. Guests keep their cart in the browser.
public class CartItem
{
    public int UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
    public DateTime AddedAtUtc { get; set; }
}
