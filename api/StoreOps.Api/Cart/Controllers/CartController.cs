using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Auth;
using StoreOps.Api.Cart.Models;
using StoreOps.Api.Cart.Services;
using StoreOps.Api.Common;

namespace StoreOps.Api.Cart.Controllers;

// The signed-in customer's own cart. Every change answers with the whole cart, so the page can redraw from it.
[ApiController]
[Route("api/cart")]
[Authorize(Policy = Policies.Shopper)]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class CartController(CartService cart) : ControllerBase
{
    [HttpGet]
    public async Task<CartResponse> Get(CancellationToken ct) => await cart.GetAsync(User.GetUserId(), ct);

    [HttpPost("items")]
    [ProducesResponseType<CartResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Add(AddToCartRequest request, CancellationToken ct) =>
        Respond(await cart.AddAsync(User.GetUserId(), request.ProductId, request.Quantity, ct));

    [HttpPut("items/{productId:int}")]
    [ProducesResponseType<CartResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> SetQuantity(int productId, SetQuantityRequest request, CancellationToken ct) =>
        Respond(await cart.SetQuantityAsync(User.GetUserId(), productId, request.Quantity, ct));

    [HttpDelete("items/{productId:int}")]
    public async Task<CartResponse> Remove(int productId, CancellationToken ct) =>
        await cart.RemoveAsync(User.GetUserId(), productId, ct);

    // Right after sign-in, with the cart the visitor built as a guest
    [HttpPost("merge")]
    public async Task<CartResponse> Merge(CartLinesRequest request, CancellationToken ct) =>
        await cart.MergeAsync(User.GetUserId(), request.Items, ct);

    // For guests: the cart in their browser, priced and checked like a saved one
    [HttpPost("preview")]
    [AllowAnonymous]
    public async Task<CartResponse> Preview(CartLinesRequest request, CancellationToken ct) =>
        await cart.PreviewAsync(request.Items, ct);

    private IActionResult Respond((CartResponse? Cart, ApiError? Error) result) =>
        result.Error is not null ? this.ErrorResponse(result.Error) : Ok(result.Cart);
}
