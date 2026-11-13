using Ardalis.Result;
using BuildingBlocks.CQRS;
using CreditTracker.Application.Dtos;

namespace CreditTracker.Application.Customers.Queries.GetUser
{
    public record GetUserQuery(string Id) : IQuery<Result<GetUserResult>>;
    public record GetUserResult(UserResponseDto User);
}
