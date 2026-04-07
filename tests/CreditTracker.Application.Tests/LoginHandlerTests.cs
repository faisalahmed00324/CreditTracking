using CreditTracker.Application.Customers.Commands.Login;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using CreditTracker.Domain.Enum;
using BuildingBlocks.Exceptions;
using BuildingBlocks.Helper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Linq.Expressions;

namespace CreditTracker.Application.Tests;

public class LoginHandlerTests
{
    private readonly Mock<IRepository<User>> _userRepoMock;
    private readonly IConfiguration _configuration;
    private readonly LoginHandler _handler;

    public LoginHandlerTests()
    {
        _userRepoMock = new Mock<IRepository<User>>();
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "JwtSettings:Secret", "4t5CbDGI9ztoBy4Qzv2iBYE1B9Ybcq4/wnhUjO6MM54=" },
            { "JwtSettings:Issuer", "https://localhost:7289" },
            { "JwtSettings:Audience", "https://localhost:7289" }
        };
        _configuration = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        _handler = new LoginHandler(_userRepoMock.Object, _configuration);
    }

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var passwordHash = PasswordHasher.Hash("Password123!");
        var user = User.Create("testuser", "test@email.com", passwordHash, Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.Id = "userId1";

        _userRepoMock.Setup(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(user);

        var command = new LoginCommand("testuser", "Password123!");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_UserNotFound_ThrowsUserNotFoundException()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync((User?)null);
        var command = new LoginCommand("nonexistent", "pass");

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<CreditTracker.Application.Exception.UserNotFoundException>();
    }

    [Fact]
    public async Task Handle_InvalidPassword_ThrowsBadRequestException()
    {
        // Arrange
        var passwordHash = PasswordHasher.Hash("CorrectPassword");
        var user = User.Create("testuser", "test@email.com", passwordHash, Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.Id = "userId1";
        _userRepoMock.Setup(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(user);

        var command = new LoginCommand("testuser", "WrongPassword");

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<BadRequestException>()
            .WithMessage("Invalid password");
    }
}
