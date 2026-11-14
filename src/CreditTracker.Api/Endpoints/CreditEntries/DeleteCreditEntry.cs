using BuildingBlocks.Helper;
using Carter;
using CreditTracker.Application.CreditEntries.Commands.DeleteCreditEntry;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.CreditEntries
{
    public record DeleteCreditEntryResponse(bool IsSuccess);
    public class DeleteCreditEntry : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/creditentry/{id}", async (string Id, ISender sender) =>
            {
                var command = new DeleteCreditEntryCommand(Id);
                var result = await sender.Send(command);
                return Results.Ok(result.Value);
            })
                .RequireAuthorization("ShopPolicy")
                .WithName("Delete Credit Entry")
                .Produces<DeleteCreditEntryResponse>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .ProducesProblem(StatusCodes.Status403Forbidden)
                .WithSummary("Delete Credit Entry")
                .WithDescription("Delete Credit Entry")
                .WithMetadata(new SwaggerOperationAttribute(
                    summary: "Delete a Credit Entry",
                    description: "Returns Boolean"
                ));
        }
    }
}
