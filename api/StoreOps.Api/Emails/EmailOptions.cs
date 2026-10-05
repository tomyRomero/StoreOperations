using MailKit.Security;

namespace StoreOps.Api.Emails;

// Plain SMTP, so any provider works: Mailpit locally (localhost:1025, no TLS), and live, Resend's
// relay (smtp.resend.com, user "resend", the API key as password) or any other. Without a Host,
// emails wait in the outbox until one is set.
public sealed class EmailOptions
{
    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public SecureSocketOptions Security { get; set; } = SecureSocketOptions.StartTls;
    public string? Username { get; set; }
    public string? Password { get; set; }

    public string FromAddress { get; set; } = "";
    // Empty sends as the store's name from Store settings
    public string? FromName { get; set; }

    // The background sender. Tests switch it off and send when they choose.
    public bool SendInBackground { get; set; } = true;
    public TimeSpan PollInterval { get; set; } = TimeSpan.FromSeconds(10);

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Host) && !string.IsNullOrWhiteSpace(FromAddress);
}
