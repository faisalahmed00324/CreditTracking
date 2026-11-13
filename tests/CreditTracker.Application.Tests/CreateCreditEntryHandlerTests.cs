using CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using CreditTracker.Domain.Enum;
using CreditTracker.Application.Exception;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;

namespace CreditTracker.Application.Tests;

public class CreateCreditEntryHandlerTests
{
    private readonly Mock<IRepository<CreditEntry>> _creditEntryRepoMock;
    private readonly Mock<IRepository<User>> _userRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateCreditEntryHandler _handler;

    public CreateCreditEntryHandlerTests()
    {
        _creditEntryRepoMock = new Mock<IRepository<CreditEntry>>();
        _userRepoMock = new Mock<IRepository<User>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateCreditEntryHandler(_creditEntryRepoMock.Object, _userRepoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsEntryId()
    {
        // Arrange
        var shop = User.Create("shop1", "shop@email.com", "hash", Role.Shop, "My Shop", "IC001", "Addr", "1", "2");
        var customer = User.Create("cust1", "cust@email.com", "hash", Role.Customer, "Customer", "IC002", "Addr", "3", "4");
        shop.Id = "shopId";
        customer.Id = "custId";

        // Handler calls GetSingle twice: first for customer (by CustomerId), then for shop (by ShopId)
        _userRepoMock.SetupSequence(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(customer)
            .ReturnsAsync(shop);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var command = new CreateCreditEntryCommand("shopId", "custId", "Widget", 50.0m, DateTime.UtcNow, false, null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _creditEntryRepoMock.Verify(r => r.Add(It.IsAny<CreditEntry>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CustomerNotFound_ThrowsUserNotFoundException()
    {
        // Arrange - first GetSingle (customer) returns null
        _userRepoMock.Setup(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync((User?)null);
        var command = new CreateCreditEntryCommand("shopId", "nonexistent", "Widget", 50.0m, DateTime.UtcNow, false, null);

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<UserNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShopNotFound_ThrowsUserNotFoundException()
    {
        // Arrange - first GetSingle (customer) succeeds, second (shop) returns null
        var customer = User.Create("cust1", "cust@email.com", "hash", Role.Customer, "Customer", "IC002", "Addr", "3", "4");
        _userRepoMock.SetupSequence(r => r.GetSingle(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(customer)
            .ReturnsAsync((User?)null);

        var command = new CreateCreditEntryCommand("nonexistent", "custId", "Widget", 50.0m, DateTime.UtcNow, false, null);

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<UserNotFoundException>();
    }
}
