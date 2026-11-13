using BuildingBlocks.Helper;
using BuildingBlocks.Pagination;
using Carter;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByShop;
using CreditTracker.Application.Dtos;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.CreditEntries
{
    public record GetCreditEntriesByShopResponse(PaginationResult<CreditEntryDto> CreditEntries);
    public class GetCreditEntriesByShop : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/creditentry/getbyshopid", async ([AsParameters] PaginationRequest request, string ShopId, ISender sender) =>
            {
                var query = new GetCreditEntriesByShopQuery(request, ShopId);
                var result = await sender.Send(query);
                return Results.Ok(result.Value);
            }).RequireAuthorization("ShopPolicy")
                .WithName("Get Credit Entry By Shop Id")
                // BUG FIX: Changed from GetCreditEntryResponse to GetCreditEntriesByShopResponse (wrong Swagger type).
                .Produces<GetCreditEntriesByShopResponse>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Get Credit Entries")
                .WithDescription("Get Credit Entries")
                .WithMetadata(new SwaggerOperationAttribute(
                    summary: "Get a Credit Entry",
                    description: "Returns a Credit Entry list"
                ));

        }
    }
}
