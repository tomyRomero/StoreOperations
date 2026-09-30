using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Settings.Models;
using StoreOps.Api.Settings.Services;

namespace StoreOps.Api.Settings.Controllers;

// The storefront's copy of the store's policies. Public, and only what customers see.
[ApiController]
[Route("api/store")]
[AllowAnonymous]
public sealed class StoreController(StoreSettingsService settings) : ControllerBase
{
    [HttpGet]
    public async Task<PublicStoreSettingsResponse> Get(CancellationToken ct) => await settings.GetPublicAsync(ct);
}
