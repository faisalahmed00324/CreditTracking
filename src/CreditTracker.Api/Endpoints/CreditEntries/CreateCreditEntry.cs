using BuildingBlocks.Helper;
using Carter;
using CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry;
using CreditTracker.Application.Dtos;
using Mapster;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.CreditEntries
{
    public record CreateCreditEntryRequest(string ShopId, string CustomerId, string Item, decimal Amount, DateTime Date, bool IsPaid, DateTime? PaymentDate);
    public record CreateCreditEntryResponse(string Id);
    public class CreateCreditEntry : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/creditentry", async (CreateCreditEntryRequest request, ISender sender) =>
            {
                var command = request.Adapt<CreateCreditEntryCommand>();
                var result = await sender.Send(command);
                return Results.Ok(result.Value);
            })
                .RequireAuthorization("ShopPolicy")
                .WithName("Create Credit Entry")
                .Produces<CreateCreditEntryResponse>(StatusCodes.Status201Created)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .ProducesProblem(StatusCodes.Status403Forbidden)
                .WithSummary("Create Credit Entry")
                .WithDescription("Create Credit Entry")
                .WithMetadata(new SwaggerOperationAttribute(
                    summary: "Create a Credit Entry",
                    description: "Returns Credit Entry id"
                ));
        }
    }
}
