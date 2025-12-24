using Ardalis.Result;
using CreditTracker.Application.Customers.Commands.CreateUser;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace CreditTracker.Application.Tests.Customers.Commands;

public class CreateUserHandlerTests
{
    private readonly Mock<IRepository<User>> _userRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateUserHandler _handler;

    public CreateUserHandlerTests()
    {
        _userRepositoryMock = new Mock<IRepository<User>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateUserHandler(_userRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnSuccessWithId_WhenUserDoesNotExist()
    {
        // Arrange
        var userDto = CreateTestUserDto();
        var command = new CreateUserCommand(userDto);
        
        _userRepositoryMock
            .Setup(x => x.Any(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(false);

        _userRepositoryMock
            .Setup(x => x.CountAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(0);

        // Capture the user being added and set its ID (simulating MongoDB behavior)
        _userRepositoryMock
            .Setup(x => x.Add(It.IsAny<User>()))
            .Callback<User>(u => u.Id = Guid.NewGuid().ToString());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _userRepositoryMock.Verify(x => x.Add(It.IsAny<User>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenUserAlreadyExists()
    {
        // Arrange
        var userDto = CreateTestUserDto();
        var command = new CreateUserCommand(userDto);
        
        _userRepositoryMock
            .Setup(x => x.Any(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<BuildingBlocks.Exceptions.BadRequestException>(
            async () => await _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ShouldHashPassword_WhenCreatingUser()
    {
        // Arrange
        var userDto = CreateTestUserDto();
        var command = new CreateUserCommand(userDto);
        User? capturedUser = null;

        _userRepositoryMock
            .Setup(x => x.Any(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(false);

        _userRepositoryMock
            .Setup(x => x.Add(It.IsAny<User>()))
            .Callback<User>(u => capturedUser = u);

        _userRepositoryMock
            .Setup(x => x.CountAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(0);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedUser.Should().NotBeNull();
        capturedUser!.PasswordHash.Should().NotBe(userDto.Password);
        capturedUser.PasswordHash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_ShouldSetOtp_WhenCreatingUser()
    {
        // Arrange
        var userDto = CreateTestUserDto();
        var command = new CreateUserCommand(userDto);
        User? capturedUser = null;

        _userRepositoryMock
            .Setup(x => x.Any(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(false);

        _userRepositoryMock
            .Setup(x => x.Add(It.IsAny<User>()))
            .Callback<User>(u => capturedUser = u);

        _userRepositoryMock
            .Setup(x => x.CountAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(0);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedUser.Should().NotBeNull();
        capturedUser!.OtpCode.Should().NotBeNullOrEmpty();
        capturedUser.OtpExpiry.Should().BeAfter(DateTime.UtcNow);
        capturedUser.IsVerified.Should().BeFalse();
    }

    private static UserDto CreateTestUserDto()
    {
        return new UserDto(
            "",  // Id (will be generated)
            "testuser",  // UserName
            "TestPassword123!",  // Password
            "Test User",  // Name
            "123456789",  // ICNoOrPassport
            Role.Customer,  // Role
            "test@example.com",  // Email
            "123 Test St",  // Address
            "1.23456",  // Latitude
            "103.45678"  // Longitude
        );
    }
}
