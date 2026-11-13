using CreditTracker.Application.Customers.Commands.CreateUser;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Models;
using CreditTracker.Domain.Enum;
using BuildingBlocks.Exceptions;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;

namespace CreditTracker.Application.Tests;

public class CreateUserHandlerTests
{
    private readonly Mock<IRepository<User>> _userRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateUserHandler _handler;

    public CreateUserHandlerTests()
    {
        _userRepoMock = new Mock<IRepository<User>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateUserHandler(_userRepoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidNewUser_ReturnsUserId()
    {
        // Arrange
        var userDto = new UserDto("", "testuser", "Pass123!", "Test User", "IC123", Role.Customer, "test@email.com", "Address", "1.0", "2.0");
        var command = new CreateUserCommand(userDto);
        _userRepoMock.Setup(r => r.Any(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _userRepoMock.Setup(r => r.CountAsync(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(0);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _userRepoMock.Verify(r => r.Add(It.IsAny<User>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_UserAlreadyExists_ThrowsBadRequestException()
    {
        // Arrange
        var userDto = new UserDto("", "existinguser", "Pass123!", "Test", "IC123", Role.Customer, "test@email.com", "Addr", "1", "2");
        var command = new CreateUserCommand(userDto);
        _userRepoMock.Setup(r => r.Any(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(true);

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<BadRequestException>()
            .WithMessage("User already exist");
    }
}
