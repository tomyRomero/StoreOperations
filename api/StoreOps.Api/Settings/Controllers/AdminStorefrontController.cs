using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Common;
using StoreOps.Api.Settings.Models;
using StoreOps.Api.Settings.Services;

namespace StoreOps.Api.Settings.Controllers;

// Theme and brand in the console: the storefront's name, look and words
[Route("api/admin/storefront")]
public sealed class AdminStorefrontController(StoreSettingsService settings) : AdminControllerBase
{
    [HttpGet]
    public async Task<StorefrontSettingsResponse> Get(CancellationToken ct) => await settings.GetStorefrontAsync(ct);

    [HttpPut]
    [ProducesResponseType<StorefrontSettingsResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(UpdateStorefrontRequest request, CancellationToken ct)
    {
        var (saved, error) = await settings.UpdateStorefrontAsync(request, AdminId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(saved);
    }
}
