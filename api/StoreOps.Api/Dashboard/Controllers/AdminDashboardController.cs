using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Common;
using StoreOps.Api.Dashboard.Models;
using StoreOps.Api.Dashboard.Services;

namespace StoreOps.Api.Dashboard.Controllers;

[Route("api/admin/dashboard")]
public sealed class AdminDashboardController(DashboardService dashboard) : AdminControllerBase
{
    // ?days=30 is the last 30 days, today included
    [HttpGet]
    public async Task<DashboardResponse> Get([FromQuery, Range(1, 365)] int days = 30, CancellationToken ct = default) =>
        await dashboard.GetAsync(days, ct);
}
