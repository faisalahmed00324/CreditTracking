using CreditTracker.Application.Customers.Commands.VerifyOtp;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;

namespace CreditTracker.Application.Tests;

public class VerifyOtpHandlerTests
{
    private readonly Mock<IRepository<User>> _userRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly VerifyOtpHandler _handler;

    public VerifyOtpHandlerTests()
    {
        _userRepoMock = new Mock<IRepository<User>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new VerifyOtpHandler(_userRepoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidOtp_ReturnsSuccess()
    {
        // Arrange
        var user = User.Create("testuser", "test@email.com", "hash", CreditTracker.Domain.Enum.Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.SetOtp("123456", DateTime.UtcNow.AddMinutes(5));
        _userRepoMock.Setup(r => r.GetById("user1")).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var command = new VerifyOtpCommand("user1", "123456");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsSuccess.Should().BeTrue();
        _userRepoMock.Verify(r => r.Update(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_InvalidOtp_ReturnsFalse()
    {
        // Arrange
        var user = User.Create("testuser", "test@email.com", "hash", CreditTracker.Domain.Enum.Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.SetOtp("123456", DateTime.UtcNow.AddMinutes(5));
        _userRepoMock.Setup(r => r.GetById("user1")).ReturnsAsync(user);

        var command = new VerifyOtpCommand("user1", "000000");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value.IsSuccess.Should().BeFalse();
        _userRepoMock.Verify(r => r.Update(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ExpiredOtp_ReturnsFalse()
    {
        // Arrange
        var user = User.Create("testuser", "test@email.com", "hash", CreditTracker.Domain.Enum.Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.SetOtp("123456", DateTime.UtcNow.AddMinutes(-1));
        _userRepoMock.Setup(r => r.GetById("user1")).ReturnsAsync(user);

        var command = new VerifyOtpCommand("user1", "123456");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_UserNotFound_ThrowsUserNotFoundException()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetById("nonexistent")).ReturnsAsync((User?)null);
        var command = new VerifyOtpCommand("nonexistent", "123456");

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<CreditTracker.Application.Exception.UserNotFoundException>();
    }
}
