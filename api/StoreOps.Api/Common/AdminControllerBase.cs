using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Auth;

namespace StoreOps.Api.Common;

// Every admin controller derives from this, so a new admin endpoint can't be left open by accident.
// AdminRoutesTests also checks that every /api/admin route requires the Admin policy.
[ApiController]
[Authorize(Policy = Policies.Admin)]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public abstract class AdminControllerBase : ControllerBase
{
    protected int AdminId => User.GetUserId();
}
