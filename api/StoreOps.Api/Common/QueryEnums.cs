using System.Text.Json;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace StoreOps.Api.Common;

// Enums in query strings and routes use the same names as JSON bodies and the published contract
// ("store_settings", "price_desc"). MVC's default binder only accepts the C# names, which rejects every
// value of two words or more. Request bodies are left to the JSON serializer.
public sealed class QueryEnumBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context) =>
        context.Metadata.UnderlyingOrModelType.IsEnum && context.BindingInfo.BindingSource != BindingSource.Body
            ? new QueryEnumBinder(context.Metadata.UnderlyingOrModelType)
            : null;
}

public sealed class QueryEnumBinder(Type enumType) : IModelBinder
{
    // "store_settings" for StoreSettings: the naming policy the JSON converter uses (Program.UseStoreJson)
    private readonly Dictionary<string, object> _values = Enum.GetNames(enumType).ToDictionary(
        name => JsonNamingPolicy.SnakeCaseLower.ConvertName(name),
        name => Enum.Parse(enumType, name),
        StringComparer.OrdinalIgnoreCase);

    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var supplied = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        if (supplied == ValueProviderResult.None)
            return Task.CompletedTask;

        bindingContext.ModelState.SetModelValue(bindingContext.ModelName, supplied);
        var text = supplied.FirstValue;

        // An empty value leaves the parameter at its default (null for an optional filter)
        if (string.IsNullOrEmpty(text))
            return Task.CompletedTask;

        if (_values.TryGetValue(text, out var value))
            bindingContext.Result = ModelBindingResult.Success(value);
        else
            bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, $"The value '{text}' is not valid.");

        return Task.CompletedTask;
    }
}
