using Microsoft.AspNetCore.Mvc;

namespace StoreOps.Api.Common;

// Errors use the standard problem-details shape plus a stable "code" the web app can switch on,
// so rewording a message never breaks the frontend.
public static class ApiProblems
{
    public static ObjectResult CodedProblem(this ControllerBase controller, int statusCode, string code, string detail)
    {
        var result = controller.Problem(statusCode: statusCode, detail: detail);
        ((ProblemDetails)result.Value!).Extensions["code"] = code;
        return result;
    }

    // A refusal decided by a service: a coded problem, or a field error when it belongs to one input
    public static IActionResult ErrorResponse(this ControllerBase controller, ApiError error)
    {
        if (error.Field is null)
            return controller.CodedProblem(error.Status, error.Code, error.Message);

        controller.ModelState.AddModelError(error.Field, error.Message);
        return controller.ValidationProblem(controller.ModelState);
    }

    // For responses written outside a controller (authentication events, the rate limiter)
    public static async Task WriteAsync(HttpContext context, int statusCode, string code, string detail)
    {
        context.Response.StatusCode = statusCode;
        await context.RequestServices.GetRequiredService<IProblemDetailsService>().WriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = { Status = statusCode, Detail = detail, Extensions = { ["code"] = code } },
        });
    }
}

// A request a service refused: its status, a stable code and a message. With a Field, it is
// reported as a validation error on that input instead, so a form can show it in place.
public sealed record ApiError(int Status, string Code, string Message, string? Field = null)
{
    public static readonly ApiError NotFound = new(StatusCodes.Status404NotFound, ErrorCodes.NotFound, "That doesn't exist.");
}

public static class ErrorCodes
{
    public const string NotFound = "NOT_FOUND";
    public const string NotSignedIn = "NOT_SIGNED_IN";
    public const string Forbidden = "FORBIDDEN";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string AccountLocked = "ACCOUNT_LOCKED";
    public const string AccountDisabled = "ACCOUNT_DISABLED";
    public const string AccountExists = "ACCOUNT_EXISTS";
    public const string InvalidResetLink = "INVALID_RESET_LINK";
    public const string RateLimited = "RATE_LIMITED";
}
