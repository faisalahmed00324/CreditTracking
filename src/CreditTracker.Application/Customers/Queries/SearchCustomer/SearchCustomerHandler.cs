using BuildingBlocks.CQRS;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Models;
using Mapster;

namespace CreditTracker.Application.Customers.Queries.SearchCustomer
{
    public class SearchCustomerHandler(IRepository<User> userRepo)
        : IQueryHandler<SearchCustomerQuery, SearchCustomerResult>
    {
        public async Task<SearchCustomerResult> Handle(SearchCustomerQuery query, CancellationToken cancellationToken)
        {
            var customers = await userRepo.TextSearchAsync(query.SearchText, x => x.Role == Domain.Enum.Role.Customer);
            if (customers == null || customers.Count == 0)
            {
                return new SearchCustomerResult(new List<UserResponseDto>());
            }

            var userDtos = customers.Adapt<List<UserResponseDto>>();
            return new SearchCustomerResult(userDtos);
        }
    }
}
