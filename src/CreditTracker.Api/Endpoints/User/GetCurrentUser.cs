using Carter;
using CreditTracker.Application.Customers.Queries.GetUser;
using CreditTracker.Application.Dtos;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace CreditTracker.Api.Endpoints.User
{
    public record GetCurrentUserResponse(UserDto User);
    public class GetCurrentUser : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/user/getcurrentuser", async (HttpContext httpContext, ISender sender) =>
            {
                var userId = httpContext.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                var result = await sender.Send(new GetUserQuery(userId!));
                return Results.Ok(result.Value);
            }).RequireAuthorization(policy => policy.RequireRole("Shop", "Customer"))
                .WithName("Get Current User")
                // BUG FIX: Changed from GetCreditEntryResponse to GetCurrentUserResponse (wrong Swagger type).
                .Produces<GetCurrentUserResponse>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Get Current User")
                .WithDescription("Get Current User")
                .WithMetadata(new SwaggerOperationAttribute(
                    summary: "Get Current User",
                    description: "Returns a User"
                ));
        }
    }
}
