using Ardalis.Result;
using BuildingBlocks.CQRS;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;

namespace CreditTracker.Application.Customers.Commands.VerifyOtp
{
    // BUG FIX: Changed from IQueryHandler to ICommandHandler — VerifyOtp modifies database state.
    public class VerifyOtpHandler(IRepository<User> userRepository, IUnitOfWork unitOfWork)
        : ICommandHandler<VerifyOtpCommand, Result<VerifyOtpResult>>
    {
        public async Task<Result<VerifyOtpResult>> Handle(VerifyOtpCommand command, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetById(command.Id);
            if (user is not null)
            {
                var isValid = user.VerifyOtp(command.Otp);
                if (isValid)
                {
                    userRepository.Update(user);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }

                return Result.Success(new VerifyOtpResult(isValid));
            }
            else
            {
                throw new Exception.UserNotFoundException(command.Id);
            }
        }
    }
}
