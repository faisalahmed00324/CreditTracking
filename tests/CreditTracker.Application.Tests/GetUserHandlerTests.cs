using CreditTracker.Application.Customers.Queries.GetUser;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using CreditTracker.Domain.Enum;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;

namespace CreditTracker.Application.Tests;

public class GetUserHandlerTests
{
    private readonly Mock<IRepository<User>> _userRepoMock;
    private readonly GetUserHandler _handler;

    public GetUserHandlerTests()
    {
        _userRepoMock = new Mock<IRepository<User>>();
        _handler = new GetUserHandler(_userRepoMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingUser_ReturnsUserDto()
    {
        // Arrange
        var user = User.Create("testuser", "test@email.com", "hash", Role.Customer, "Test User", "IC123", "Address", "1.0", "2.0");
        user.Id = "userId1";
        _userRepoMock.Setup(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(user);

        var query = new GetUserQuery("userId1");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.User.Should().NotBeNull();
        result.Value.User.Name.Should().Be("Test User");
    }

    [Fact]
    public async Task Handle_NonExistentUser_ThrowsUserNotFoundException()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync((User?)null);
        var query = new GetUserQuery("nonexistent");

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(query, CancellationToken.None))
            .Should().ThrowAsync<CreditTracker.Application.Exception.UserNotFoundException>();
    }
}
