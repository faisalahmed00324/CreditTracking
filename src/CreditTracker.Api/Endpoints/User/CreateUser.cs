using Ardalis.Result;
using BuildingBlocks.Helper;
using Carter;
using CreditTracker.Application.Customers.Commands.CreateUser;
using CreditTracker.Application.Dtos;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.User
{

    public record CreateUserRequest(UserDto User);
    public record CreateUserResponse(string Id);
    public class CreateUser : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/user", async (CreateUserRequest request, ISender sender) =>
            {
                var command = new CreateUserCommand(request.User);
                var result = await sender.Send(command);
                return Results.Ok(result.Value);
            })
            .WithName("CreateUser")
            .Produces<CreateUserResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Create User")
            .WithDescription("Create User for role customr. Role id is 2")
            .WithMetadata(new SwaggerOperationAttribute(
                summary: "Create a user",
                description: "Returns user id"
            ));
        }
    }
}
