using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Common;
using StoreOps.Api.Settings.Models;
using StoreOps.Api.Settings.Services;

namespace StoreOps.Api.Settings.Controllers;

[Route("api/admin/settings")]
public sealed class AdminSettingsController(StoreSettingsService settings) : AdminControllerBase
{
    [HttpGet]
    public async Task<StoreSettingsResponse> Get(CancellationToken ct) => await settings.GetAsync(ct);

    [HttpPut]
    [ProducesResponseType<StoreSettingsResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(UpdateStoreSettingsRequest request, CancellationToken ct)
    {
        var (saved, error) = await settings.UpdateAsync(request, AdminId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(saved);
    }
}
