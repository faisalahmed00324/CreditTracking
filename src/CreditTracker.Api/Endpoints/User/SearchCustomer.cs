using Carter;
using CreditTracker.Application.Customers.Queries.SearchCustomer;
using CreditTracker.Application.Dtos;
using MediatR;
using Swashbuckle.AspNetCore.Annotations;

namespace CreditTracker.Api.Endpoints.User
{
    public record SearchCustomerResponse(List<UserResponseDto> Users);
    public class SearchCustomer : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/user/search/{searchText}", async (string SearchText, ISender sender) =>
            {
                var query = new SearchCustomerQuery(SearchText);
                var result = await sender.Send(query);
                return Results.Ok(result);
            }).RequireAuthorization("ShopPolicy")
                .WithName("Search Customers")
                .Produces<SearchCustomerResponse>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Search Customers")
                .WithDescription("Returns matching customer profiles without credentials")
                .WithMetadata(new SwaggerOperationAttribute(
                    summary: "Search Customers",
                    description: "Returns matching customer profiles without credentials"
                ));
        }
    }
}
