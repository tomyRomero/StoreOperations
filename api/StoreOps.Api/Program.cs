var builder = WebApplication.CreateBuilder(args);

// Every error, expected or not, is returned as RFC 9457 problem details (application/problem+json)
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

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
