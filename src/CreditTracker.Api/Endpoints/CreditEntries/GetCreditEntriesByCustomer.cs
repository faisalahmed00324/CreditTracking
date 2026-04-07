using BuildingBlocks.Helper;
using BuildingBlocks.Pagination;
using Carter;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByCustomer;
using CreditTracker.Application.Dtos;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.CreditEntries
{
    // BUG FIX: Fixed typo — "Respopnse" → "Response".
    public record GetCreditEntriesByCustomerResponse(PaginationResult<CreditEntryDto> CreditEntries);
    public class GetCreditEntriesByCustomer : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/creditentry/getbycustomerid", async ([AsParameters] PaginationRequest request, string CustomerId, ISender sender) =>
            {
                var query = new GetCreditEntriesByCustomerQuery(request, CustomerId);
                var result = await sender.Send(query);
                return Results.Ok(result.Value);
            }).RequireAuthorization("CustomerPolicy")
                .WithName("Get Credit Entry By Customer Id")
                // BUG FIX: Changed from GetCreditEntryResponse to GetCreditEntriesByCustomerResponse (wrong Swagger type).
                .Produces<GetCreditEntriesByCustomerResponse>(StatusCodes.Status200OK)
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
