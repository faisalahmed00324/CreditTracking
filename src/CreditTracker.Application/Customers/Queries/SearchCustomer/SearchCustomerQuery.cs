using BuildingBlocks.CQRS;
using CreditTracker.Application.Dtos;

namespace CreditTracker.Application.Customers.Queries.SearchCustomer
{
    public record SearchCustomerQuery(string SearchText) : IQuery<SearchCustomerResult>;
    public record SearchCustomerResult(List<UserResponseDto> Users);
}
