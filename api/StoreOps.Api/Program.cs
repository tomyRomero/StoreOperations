using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Account.Services;
using StoreOps.Api.Auth;
using StoreOps.Api.Cart.Services;
using StoreOps.Api.Catalog.Services;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Images;

var builder = WebApplication.CreateBuilder(args);

// Every error, expected or not, is returned as RFC 9457 problem details (application/problem+json)
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

builder.Services
    .AddControllers(options =>
        // Validation errors are keyed by the JSON names the client sent ("email", not "Email")
        options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider()))
    .AddJsonOptions(options =>
        // Enums travel as readable strings ("no_returns"), the same convention as Clareion's API
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower)));

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<TimestampInterceptor>();
builder.Services.AddDbContext<AppDbContext>((services, options) => options
    .UseSqlServer(
        services.GetRequiredService<IConfiguration>().GetConnectionString("Database")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:Database is not set. Locally it comes from dotnet user-secrets; " +
                "in production from the ConnectionStrings__Database environment variable."),
        // Retries brief connection drops. Explicit transactions must then run inside
        // Database.CreateExecutionStrategy(), which EF enforces.
        sql => sql.EnableRetryOnFailure())
    .AddInterceptors(services.GetRequiredService<TimestampInterceptor>()));

builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

builder.Services.AddImageStorage();
builder.Services.AddScoped<CatalogService>();
builder.Services.AddScoped<CategoryAdminService>();
builder.Services.AddScoped<ProductAdminService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<AddressService>();

builder.Services.AddEdgeSecurity(builder.Configuration);
builder.Services.AddStoreOpsAuth(builder.Configuration, builder.Environment);

var app = builder.Build();

// dotnet run --project StoreOps.Api -- seed: rebuild the local database with demo data, then exit
if (args is ["seed"])
{
    if (!app.Environment.IsDevelopment())
        throw new InvalidOperationException("Refusing to seed outside the Development environment.");

    await DevSeeder.RunAsync(app.Services);
    Console.WriteLine($"Seeded the demo store. Sign in as admin@example.test or customer@example.test, password {DevSeeder.DemoPassword}");
    return;
}

// First, so everything after it sees the browser's address instead of the Next server's
app.UseForwardedHeaders();

app.UseExceptionHandler();
app.UseStatusCodePages();

// Before authentication, so a refused request costs as little as possible
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    // The API contract. The web app generates its TypeScript types from it.
    app.MapOpenApi().AllowAnonymous();
}

app.MapHealthChecks("/health").AllowAnonymous();

app.Run();
