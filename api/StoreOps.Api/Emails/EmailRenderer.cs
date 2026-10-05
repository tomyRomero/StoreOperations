using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace StoreOps.Api.Emails;

// Renders an email template (a Razor component) to HTML. Razor HTML-encodes every value it writes,
// so a product name or address can never inject markup into an email.
public sealed class EmailRenderer(IServiceProvider services, ILoggerFactory loggers)
{
    public async Task<string> RenderAsync<TTemplate>(Dictionary<string, object?> parameters) where TTemplate : IComponent
    {
        await using var renderer = new HtmlRenderer(services, loggers);
        return await renderer.Dispatcher.InvokeAsync(async () =>
            (await renderer.RenderComponentAsync<TTemplate>(ParameterView.FromDictionary(parameters))).ToHtmlString());
    }
}
