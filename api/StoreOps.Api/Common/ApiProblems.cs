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

public static class ErrorCodes
{
    public const string NotSignedIn = "NOT_SIGNED_IN";
    public const string Forbidden = "FORBIDDEN";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string AccountLocked = "ACCOUNT_LOCKED";
    public const string AccountDisabled = "ACCOUNT_DISABLED";
    public const string AccountExists = "ACCOUNT_EXISTS";
}
