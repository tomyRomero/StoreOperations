using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Contact.Models;

public sealed record ContactRequest
{
    [Required, StringLength(100)]
    public string Name { get; init; } = "";

    [Required, EmailAddress, StringLength(256)]
    public string Email { get; init; } = "";

    [Required, StringLength(150)]
    public string Subject { get; init; } = "";

    [Required, StringLength(5_000, MinimumLength = 10)]
    public string Message { get; init; } = "";
}
