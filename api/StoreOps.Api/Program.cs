using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Data;

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

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    // The API contract. The web app generates its TypeScript types from it.
    app.MapOpenApi();
}

app.MapHealthChecks("/health");

app.Run();
