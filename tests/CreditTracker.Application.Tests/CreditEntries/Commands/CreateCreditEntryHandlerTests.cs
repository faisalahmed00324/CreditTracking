using Ardalis.Result;
using CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace CreditTracker.Application.Tests.CreditEntries.Commands;

public class CreateCreditEntryHandlerTests
{
    private readonly Mock<IRepository<CreditEntry>> _creditEntryRepositoryMock;
    private readonly Mock<IRepository<User>> _userRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateCreditEntryHandler _handler;

    public CreateCreditEntryHandlerTests()
    {
        _creditEntryRepositoryMock = new Mock<IRepository<CreditEntry>>();
        _userRepositoryMock = new Mock<IRepository<User>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateCreditEntryHandler(
            _creditEntryRepositoryMock.Object,
            _userRepositoryMock.Object,
            _unitOfWorkMock.Object
        );
    }

    [Fact]
    public async Task Handle_ShouldReturnSuccess_WhenBothUsersExist()
    {
        // Arrange
        var shop = CreateUser("shop123", "Test Shop", Role.Shop);
        var customer = CreateUser("customer456", "Test Customer", Role.Customer);
        var command = new CreateCreditEntryCommand(
            "shop123",
            "customer456",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        // Setup returns customer first, then shop
        _userRepositoryMock
            .SetupSequence(x => x.GetSingle(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(customer)
            .ReturnsAsync(shop);

        // Simulate ID being set by repository
        _creditEntryRepositoryMock
            .Setup(x => x.Add(It.IsAny<CreditEntry>()))
            .Callback<CreditEntry>(entry => entry.Id = Guid.NewGuid().ToString());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _creditEntryRepositoryMock.Verify(x => x.Add(It.IsAny<CreditEntry>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenCustomerNotFound()
    {
        // Arrange
        var shop = CreateUser("shop123", "Test Shop", Role.Shop);
        var command = new CreateCreditEntryCommand(
            "shop123",
            "nonexistent",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        _userRepositoryMock
            .SetupSequence(x => x.GetSingle(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync((User?)null)
            .ReturnsAsync(shop);

        // Act & Assert
        await Assert.ThrowsAsync<CreditTracker.Application.Exception.UserNotFoundException>(
            async () => await _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenShopNotFound()
    {
        // Arrange
        var customer = CreateUser("customer456", "Test Customer", Role.Customer);
        var command = new CreateCreditEntryCommand(
            "nonexistent",
            "customer456",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        _userRepositoryMock
            .SetupSequence(x => x.GetSingle(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(customer)
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<CreditTracker.Application.Exception.UserNotFoundException>(
            async () => await _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ShouldCreateCreditEntry_WithCorrectDetails()
    {
        // Arrange
        var shop = CreateUser("shop123", "Test Shop", Role.Shop);
        var customer = CreateUser("customer456", "Test Customer", Role.Customer);
        CreditEntry? capturedEntry = null;

        var command = new CreateCreditEntryCommand(
            "shop123",
            "customer456",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        _userRepositoryMock
            .SetupSequence(x => x.GetSingle(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(customer)
            .ReturnsAsync(shop);

        _creditEntryRepositoryMock
            .Setup(x => x.Add(It.IsAny<CreditEntry>()))
            .Callback<CreditEntry>(entry => capturedEntry = entry);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedEntry.Should().NotBeNull();
        capturedEntry!.ShopId.Should().Be("shop123");
        capturedEntry.ShopName.Should().Be("Test Shop");
        capturedEntry.CustomerId.Should().Be("customer456");
        capturedEntry.CustomerName.Should().Be("Test Customer");
        capturedEntry.Item.Should().Be("Test Item");
        capturedEntry.Amount.Should().Be(100.50m);
        capturedEntry.IsPaid.Should().BeFalse();
    }

    private static User CreateUser(string id, string name, Role role)
    {
        var user = User.Create(
            $"user_{id}",
            $"{id}@example.com",
            "hashedPassword",
            role,
            name,
            "123456789",
            "123 Test St",
            "1.23456",
            "103.45678"
        );
        return user;
    }
}
