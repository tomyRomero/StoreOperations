using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;

var builder = WebApplication.CreateBuilder(args);

// Every error, expected or not, is returned as RFC 9457 problem details (application/problem+json)
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

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

// Accounts: Identity's user store and password hashing. Sign-in endpoints come with the login feature.
builder.Services.AddIdentityCore<ApplicationUser>(options => options.User.RequireUniqueEmail = true)
    .AddRoles<IdentityRole<int>>()
    .AddEntityFrameworkStores<AppDbContext>();

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

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    // The API contract. The web app generates its TypeScript types from it.
    app.MapOpenApi();
}

app.MapHealthChecks("/health");

app.Run();
