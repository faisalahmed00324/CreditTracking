using Ardalis.Result;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using BuildingBlocks.Helper;
using CreditTracker.Application.Commons;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;
using Mapster;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;


namespace CreditTracker.Application.Customers.Commands.Login
{
    partial class LoginHandler(IRepository<User> userRepo, JwtSettings jwtSettings) : ICommandHandler<LoginCommand, Result<LoginResult>>
    {
        public async Task<Result<LoginResult>> Handle(LoginCommand command, CancellationToken cancellationToken)
        {
            var user = await userRepo.GetSingle(x => x.UserName == command.UserName && x.IsVerified == true && x.IsActive == true);
            if (user is null)    
            {
                throw new UserNotFoundException(command.UserName);
            }
            if(!PasswordHasher.Verify(command.Password, user.PasswordHash))
            {
                throw new BadRequestException("Invalid password");
            }
            var userDto = user.Adapt<UserDto>();
            var token = GenerateToken(userDto);
            return Result.Success(new LoginResult(token));
        }

        public string GenerateToken(UserDto user)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

            var creds = new SigningCredentials(jwtSettings.SigningKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
