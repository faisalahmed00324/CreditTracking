using BuildingBlocks.Helper;
using Carter;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntry;
using CreditTracker.Application.Dtos;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.CreditEntries
{
    public record GetCreditEntryResponse(CreditEntryDto CreditEntry);
    public class GetCreditEntry : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/creditentry/{id}", async (string Id, ISender sender) =>
            {
                var query = new GetCreditEntryQuery(Id);
                var result = await sender.Send(query);
                return Results.Ok(result.Value);
            }).RequireAuthorization(policy => policy.RequireRole("Shop", "Customer"))
                .WithName("Get Credit Entry")
                .Produces<GetCreditEntryResponse>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .ProducesProblem(StatusCodes.Status403Forbidden)
                .WithSummary("Get Credit Entry")
                .WithDescription("Get Credit Entry")
                .WithMetadata(new SwaggerOperationAttribute(
                    summary: "Get a Credit Entry",
                    description: "Returns a Credit Entry"
                ));
        }
    }
}

