using StoreOps.Api.Common;
using StoreOps.Api.Contact.Models;
using StoreOps.Api.Data;
using StoreOps.Api.Emails;

namespace StoreOps.Api.Contact.Services;

public static class ContactErrors
{
    public static readonly ApiError NotConfigured = new(StatusCodes.Status503ServiceUnavailable, "CONTACT_NOT_CONFIGURED",
        "The contact form isn't set up yet. Please try again later.");
}

// The contact form: the message goes to the store's inbox (Store settings), and replying answers the
// customer. Nothing is sent to the address typed in, so the form can't be used to email strangers.
public sealed class ContactService(AppDbContext db, StoreEmails emails)
{
    public async Task<ApiError?> SendAsync(ContactRequest request, CancellationToken ct)
    {
        var subject = request.Subject.ReplaceLineEndings(" ").Trim();
        if (!await emails.AddSupportRequestAsync(request.Name.Trim(), request.Email.Trim(), subject, request.Message.Trim(), ct))
            return ContactErrors.NotConfigured;

        await db.SaveChangesAsync(ct);
        return null;
    }
}
