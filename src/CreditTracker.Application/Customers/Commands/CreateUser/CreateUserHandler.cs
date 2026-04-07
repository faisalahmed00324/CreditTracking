using Ardalis.Result;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using BuildingBlocks.Helper;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Models;

namespace CreditTracker.Application.Customers.Commands.CreateUser
{
    public class CreateUserHandler(IRepository<User> userRepository, IUnitOfWork unitOfWork)
        : ICommandHandler<CreateUserCommand, Result<CreateUserResult>>
    {
        public async Task<Result<CreateUserResult>> Handle(CreateUserCommand command, CancellationToken cancellationToken)
        {
            if (await userRepository.Any(x => x.UserName == command.User.UserName && x.IsVerified && x.IsActive))
            {
                throw new BadRequestException("User already exist");
            }
            var otp = GenerateOtp();
            var otpExpiry = DateTime.UtcNow.AddMinutes(5);
            var user = CreateNewUser(command.User, otp, otpExpiry);
            userRepository.Add(user);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            await SendOtp(otp);
            return Result.Success(new CreateUserResult(user.Id));
        }
        private User CreateNewUser(UserDto userDto, string otp, DateTime expiry)
        {
            var newUser = User.Create(userDto.UserName, userDto.Email, PasswordHasher.Hash(userDto.Password),userDto.Role, userDto.Name, userDto.ICNoOrPassport, userDto.Address, userDto.Latitude, userDto.Longitude);
            newUser.SetOtp(otp, expiry);
            return newUser;
        }
        // BUG FIX: Changed from new Random() to Random.Shared to avoid duplicate OTPs
        // when called in quick succession (new Random() seeds from system clock).
        private string GenerateOtp()
        {
            return Random.Shared.Next(100000, 999999).ToString();
        }
        // NOTE: Placeholder implementation — needs SMS/email service integration.
        private async Task SendOtp(string otp)
        {
            await userRepository.CountAsync(x => x.OtpCode == otp);
        }
    }
}
