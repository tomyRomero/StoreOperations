using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;

namespace StoreOps.Api.Data;

// Rebuilds the local database with demo data: dotnet run --project StoreOps.Api -- seed
//
// It deletes the database first, so it only runs against a server on this machine and a database
// whose name starts with "Palettehub". There is no override.
public static class DevSeeder
{
    public const string DemoPassword = "Demo-Pass-123!";

    private static readonly (string Name, string ImageFile)[] Categories =
    [
        ("Paint", "paint.jpg"),
        ("Brushes", "brushes.jpg"),
        ("Canvas", "canvas.jpg"),
    ];

    private sealed record SeedProduct(
        string Name, string Category, int PriceCents, int Stock, string ImageFile, string Description,
        int? CompareAtPriceCents = null, string? DealDescription = null);

    private static readonly SeedProduct[] Products =
    [
        new("Oil Paint Set", "Paint", 3499, 12, "oilpaint.jpg", "Twelve artist-grade oil colors with rich pigment and a buttery consistency, ready for canvas or panel.", 4499, "Spring sale on oils"),
        new("Chalk Paint", "Paint", 1850, 0, "chalkpaint.jpg", "A matte, fast-drying chalk finish for furniture, frames and decor. No sanding or priming needed."),
        new("Watercolor Set", "Paint", 2200, 30, "watercolorset.jpg", "Twenty-four half pans of vivid, easy-to-blend watercolors in a travel tin with a mixing lid."),
        new("Bucket Paint", "Paint", 4500, 8, "bucketpaint.jpg", "One gallon of low-odor acrylic paint for murals and large studio projects."),
        new("Fine Brush", "Brushes", 699, 40, "finebrush.jpg", "A round synthetic brush with a sharp point for detail work and clean lines."),
        new("Super Fine Brush", "Brushes", 849, 4, "superfine.jpg", "An extra-fine liner brush for lettering, whiskers and the smallest details."),
        new("Wide Brush", "Brushes", 950, 25, "widebrush.jpg", "A two-inch flat brush for washes, backgrounds and smooth, even coats."),
        new("Brush Set", "Brushes", 2499, 15, "brushset.jpg", "Ten brushes in rounds, flats and filberts, for oils, acrylics and watercolor.", 2999, "Save on the starter set"),
        new("Paint Roller", "Brushes", 1200, 9, "paintroller.jpg", "A nine-inch roller with a comfortable grip for walls and large surfaces."),
        new("Landscape Canvas", "Canvas", 2900, 6, "landscapecanvas.jpg", "A wide, triple-primed cotton canvas stretched over a solid pine frame."),
        new("Rectangle Canvas", "Canvas", 1900, 14, "rectanglecanvas.jpg", "A classic 16 by 20 inch primed canvas, ready for any medium."),
        new("Canvas Booklet", "Canvas", 1125, 22, "canvasbooklet.jpg", "Ten primed canvas sheets bound in a pad, ideal for studies and practice."),
        new("Canvas Sign", "Canvas", 1500, 3, "canvassign.jpg", "A small canvas panel with a hanging cord, made for lettering and gifts."),
    ];

    private static readonly PostalAddress CustomerAddress =
        new("Demo Customer", "1 Demo Street", null, "Springfield", "IL", "12345", "US");

    public static async Task RunAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        EnsureSafeTarget(db.Database.GetConnectionString());

        await db.Database.EnsureDeletedAsync(cancellationToken);
        await db.Database.MigrateAsync(cancellationToken);

        var now = DateTime.UtcNow;

        var admin = await CreateUserAsync(users, "demo-admin", "admin@example.test", now.AddDays(-30));
        await Succeed(users.AddToRoleAsync(admin, Roles.Admin));
        var customer = await CreateUserAsync(users, "demo-customer", "customer@example.test", now.AddDays(-20));

        var categories = Categories.ToDictionary(
            c => c.Name,
            c => new Category { Name = c.Name, ImageKey = CategoryImageKey(c.ImageFile) });

        // Newest first in "sort by date", one minute apart
        var products = Products.Select((p, i) => new Product
        {
            Category = categories[p.Category],
            Name = p.Name,
            Description = p.Description,
            PriceCents = p.PriceCents,
            CompareAtPriceCents = p.CompareAtPriceCents,
            DealDescription = p.DealDescription,
            Stock = p.Stock,
            ImageKey = ProductImageKey(p.ImageFile),
            CreatedAtUtc = now.AddMinutes(-i),
        }).ToDictionary(p => p.Name);
        db.Products.AddRange(products.Values);

        db.UserAddresses.Add(new UserAddress { UserId = customer.Id, Address = CustomerAddress, IsDefault = true });

        db.CartItems.AddRange(
            new CartItem { UserId = customer.Id, Product = products["Watercolor Set"], Quantity = 1, AddedAtUtc = now },
            new CartItem { UserId = customer.Id, Product = products["Fine Brush"], Quantity = 2, AddedAtUtc = now });

        db.Orders.AddRange(
            SeedOrder("SEED0001", 1, customer, admin, products, now.AddDays(-12), OrderStatus.Delivered, "1Z999AA10123456784",
                ("Brush Set", 1), ("Rectangle Canvas", 2)),
            SeedOrder("SEED0002", 2, customer, admin, products, now.AddDays(-3), OrderStatus.Shipped, "1Z999AA10123456785",
                ("Landscape Canvas", 1)),
            SeedOrder("SEED0003", 3, customer, admin, products, now, OrderStatus.Pending, null,
                ("Oil Paint Set", 1), ("Fine Brush", 3)));

        var newestSubscriber = new NewsletterSubscriber { Email = "customer@example.test", UnsubscribeToken = NewToken(), SubscribedAtUtc = now.AddDays(-5) };
        db.NewsletterSubscribers.AddRange(
            new NewsletterSubscriber { Email = "reader@example.test", UnsubscribeToken = NewToken(), SubscribedAtUtc = now.AddDays(-10) },
            newestSubscriber);

        await db.SaveChangesAsync(cancellationToken);

        var newestOrder = await db.Orders.SingleAsync(o => o.OrderNumber == "SEED0003", cancellationToken);
        // With the same details the real events record, so the activity feed reads the same
        db.ActivityLog.AddRange(
            new ActivityLogEntry
            {
                Action = ActivityAction.UserRegistered, EntityType = ActivityEntity.User, EntityId = customer.Id, OccurredAtUtc = now.AddHours(-1),
                DetailsJson = JsonSerializer.Serialize(new { username = customer.UserName }),
            },
            new ActivityLogEntry
            {
                Action = ActivityAction.OrderCreated, EntityType = ActivityEntity.Order, EntityId = newestOrder.Id, OccurredAtUtc = now.AddMinutes(-30),
                DetailsJson = JsonSerializer.Serialize(new { orderNumber = newestOrder.OrderNumber, totalCents = newestOrder.TotalCents, refunded = false }),
            },
            new ActivityLogEntry
            {
                Action = ActivityAction.NewsletterSubscribed, EntityType = ActivityEntity.NewsletterSubscriber, EntityId = newestSubscriber.Id,
                OccurredAtUtc = now.AddMinutes(-10),
            });
        await db.SaveChangesAsync(cancellationToken);

        await UploadImagesAsync(scope.ServiceProvider.GetRequiredService<ImageStorage>(), cancellationToken);
    }

    // The photos ship with the API in Data/SeedImages (resized to 1600 px). Uploading again just overwrites them.
    private static async Task UploadImagesAsync(ImageStorage images, CancellationToken ct)
    {
        var keys = Categories.Select(c => CategoryImageKey(c.ImageFile))
            .Concat(Products.Select(p => ProductImageKey(p.ImageFile)));

        foreach (var key in keys)
        {
            var file = Path.Combine(AppContext.BaseDirectory, "Data", "SeedImages", key["seed/".Length..]);
            await images.PutAsync(key, await File.ReadAllBytesAsync(file, ct), "image/jpeg", ct);
        }
    }

    // Refuses anything but a Palettehub database on this machine
    public static void EnsureSafeTarget(string? connectionString)
    {
        var target = new SqlConnectionStringBuilder(connectionString);
        var host = target.DataSource.Split(',')[0].Trim();
        if (host.StartsWith("tcp:", StringComparison.OrdinalIgnoreCase)) host = host[4..];

        if (host is not ("localhost" or "127.0.0.1" or "::1" or "(local)" or "."))
            throw new InvalidOperationException($"Refusing to seed: the database server '{host}' is not on this machine.");

        if (!target.InitialCatalog.StartsWith("Palettehub", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException(
                $"Refusing to seed: the database '{target.InitialCatalog}' is not a Palettehub database.");
    }

    private static async Task<ApplicationUser> CreateUserAsync(
        UserManager<ApplicationUser> users, string userName, string email, DateTime createdAtUtc)
    {
        var user = new ApplicationUser { UserName = userName, Email = email, EmailConfirmed = true, CreatedAtUtc = createdAtUtc };
        await Succeed(users.CreateAsync(user, DemoPassword));
        return user;
    }

    private static Order SeedOrder(
        string orderNumber, int sequence, ApplicationUser customer, ApplicationUser admin,
        Dictionary<string, Product> products, DateTime placedAtUtc, OrderStatus status, string? trackingNumber,
        params (string Product, int Quantity)[] items)
    {
        var lines = items.Select(item =>
        {
            var product = products[item.Product];
            return new OrderLine
            {
                Product = product,
                ProductName = product.Name,
                UnitPriceCents = product.PriceCents,
                ImageKey = product.ImageKey,
                Quantity = item.Quantity,
            };
        }).ToList();

        var subtotal = lines.Sum(l => l.UnitPriceCents * l.Quantity);

        // The timeline: placed (by the system), then shipped and delivered by the admin
        List<OrderStatusChange> history = [new() { Status = OrderStatus.Pending, ChangedAtUtc = placedAtUtc }];
        if (status is OrderStatus.Shipped or OrderStatus.Delivered)
            history.Add(new() { Status = OrderStatus.Shipped, ChangedAtUtc = placedAtUtc.AddDays(1), ChangedByUserId = admin.Id });
        if (status is OrderStatus.Delivered)
            history.Add(new() { Status = OrderStatus.Delivered, ChangedAtUtc = placedAtUtc.AddDays(4), ChangedByUserId = admin.Id });

        return new Order
        {
            OrderNumber = orderNumber,
            UserId = customer.Id,
            Status = status,
            ShipTo = CustomerAddress,
            SubtotalCents = subtotal,
            ShippingCents = 1000,
            TaxCents = 0,
            TotalCents = subtotal + 1000,
            StripePaymentIntentId = $"pi_seed_{sequence:0000}",
            StripeTaxCalculationId = "taxcalc_seed",
            Carrier = trackingNumber is null ? null : Carrier.Ups,
            TrackingNumber = trackingNumber,
            EstimatedDeliveryDate = status == OrderStatus.Shipped ? DateOnly.FromDateTime(placedAtUtc.AddDays(5)) : null,
            PlacedAtUtc = placedAtUtc,
            Lines = lines,
            StatusHistory = history,
        };
    }

    private static string CategoryImageKey(string file) => $"seed/categories/{file}";

    private static string ProductImageKey(string file) => $"seed/products/{file}";

    private static string NewToken() => Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));

    private static async Task Succeed(Task<IdentityResult> operation)
    {
        var result = await operation;
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join(" ", result.Errors.Select(e => e.Description)));
    }
}
