using StoreOps.Api.Common;

namespace StoreOps.Api.Emails;

public static class EmailsServiceCollectionExtensions
{
    public static IServiceCollection AddEmails(this IServiceCollection services)
    {
        services.AddOptions<EmailOptions>().BindConfiguration("Email");
        services.AddOptions<SiteOptions>().BindConfiguration("Site");
        services.AddSingleton<EmailRenderer>();
        services.AddScoped<StoreEmails>();
        services.AddScoped<EmailOutboxSender>();
        services.AddHostedService<EmailOutboxWorker>();
        return services;
    }
}
