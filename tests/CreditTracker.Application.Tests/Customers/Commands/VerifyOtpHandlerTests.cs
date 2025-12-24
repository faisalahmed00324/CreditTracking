using Ardalis.Result;
using CreditTracker.Application.Customers.Commands.VerifyOtp;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;
using Xunit;

namespace CreditTracker.Application.Tests.Customers.Commands;

public class VerifyOtpHandlerTests
{
    private readonly Mock<IRepository<User>> _userRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly VerifyOtpHandler _handler;

    public VerifyOtpHandlerTests()
    {
        _userRepositoryMock = new Mock<IRepository<User>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new VerifyOtpHandler(_userRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnTrue_WhenOtpIsValid()
    {
        // Arrange
        var user = CreateTestUser();
        var otpCode = "123456";
        user.SetOtp(otpCode, DateTime.UtcNow.AddMinutes(5));
        var command = new VerifyOtpCommand(user.Id, otpCode);

        _userRepositoryMock
            .Setup(x => x.GetById(user.Id))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsSuccess.Should().BeTrue();
        _userRepositoryMock.Verify(x => x.Update(It.IsAny<User>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldReturnFalse_WhenOtpIsInvalid()
    {
        // Arrange
        var user = CreateTestUser();
        var correctOtp = "123456";
        var incorrectOtp = "999999";
        user.SetOtp(correctOtp, DateTime.UtcNow.AddMinutes(5));
        var command = new VerifyOtpCommand(user.Id, incorrectOtp);

        _userRepositoryMock
            .Setup(x => x.GetById(user.Id))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsSuccess.Should().BeFalse();
        _userRepositoryMock.Verify(x => x.Update(It.IsAny<User>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldReturnFalse_WhenOtpIsExpired()
    {
        // Arrange
        var user = CreateTestUser();
        var otpCode = "123456";
        user.SetOtp(otpCode, DateTime.UtcNow.AddMinutes(-1)); // Expired
        var command = new VerifyOtpCommand(user.Id, otpCode);

        _userRepositoryMock
            .Setup(x => x.GetById(user.Id))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsSuccess.Should().BeFalse();
        _userRepositoryMock.Verify(x => x.Update(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenUserNotFound()
    {
        // Arrange
        var command = new VerifyOtpCommand("nonexistent-id", "123456");

        _userRepositoryMock
            .Setup(x => x.GetById(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<CreditTracker.Application.Exception.UserNotFoundException>(
            async () => await _handler.Handle(command, CancellationToken.None));
    }

    private static User CreateTestUser()
    {
        return User.Create(
            "testuser",
            "test@example.com",
            "hashedPassword",
            Role.Customer,
            "Test User",
            "123456789",
            "123 Test St",
            "1.23456",
            "103.45678"
        );
    }
}
