using Carter;
using CreditTracker.Application.Customers.Queries.GetUser;
using CreditTracker.Application.Dtos;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.User
{
    public record GetUserResponse(UserDto User);
    public class GetUserById : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/user/{id}", async (string Id, ISender sender) =>
            {
                var query = new GetUserQuery(Id);
                var result = await sender.Send(query);
                return Results.Ok(result.Value);
            }).RequireAuthorization("ShopPolicy")
                .WithName("Get User by Id")
                // BUG FIX: Changed from GetCreditEntryResponse to GetUserResponse (wrong Swagger type).
                .Produces<GetUserResponse>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Get a User")
                .WithDescription("Get a User")
                .WithMetadata(new SwaggerOperationAttribute(
                    summary: "Get a User",
                    description: "Returns a User"
                ));
        }
    }
}
