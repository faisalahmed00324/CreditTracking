using Ardalis.Result;
using BuildingBlocks.CQRS;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;
using Mapster;

namespace CreditTracker.Application.Customers.Queries.GetUser
{
    internal class GetUserHandler(IRepository<User> userRepo) : IQueryHandler<GetUserQuery, Result<GetUserResult>>
    {
        public async Task<Result<GetUserResult>> Handle(GetUserQuery query, CancellationToken cancellationToken)
        {
            var user = await userRepo.GetSingle(x => x.Id == query.Id && x.IsActive);
            if (user == null)
            {
                throw new UserNotFoundException(query.Id);
            }

            var userDto = user.Adapt<UserResponseDto>();
            return Result.Success(new GetUserResult(userDto));
        }
    }
}
