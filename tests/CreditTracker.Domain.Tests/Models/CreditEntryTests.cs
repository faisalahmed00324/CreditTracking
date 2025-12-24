using CreditTracker.Domain.Events;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Xunit;

namespace CreditTracker.Domain.Tests.Models;

public class CreditEntryTests
{
    [Fact]
    public void Create_ShouldReturnCreditEntry_WhenValidDataProvided()
    {
        // Arrange
        var shopId = "shop123";
        var shopName = "Test Shop";
        var customerId = "customer456";
        var customerName = "Test Customer";
        var item = "Test Item";
        var amount = 100.50m;
        var date = DateTime.UtcNow;
        var isPaid = false;
        DateTime? paymentDate = null;

        // Act
        var creditEntry = CreditEntry.Create(shopId, shopName, customerId, customerName, item, amount, date, isPaid, paymentDate);

        // Assert
        creditEntry.Should().NotBeNull();
        creditEntry.ShopId.Should().Be(shopId);
        creditEntry.ShopName.Should().Be(shopName);
        creditEntry.CustomerId.Should().Be(customerId);
        creditEntry.CustomerName.Should().Be(customerName);
        creditEntry.Item.Should().Be(item);
        creditEntry.Amount.Should().Be(amount);
        creditEntry.Date.Should().Be(date);
        creditEntry.IsPaid.Should().BeFalse();
        creditEntry.PaymentDate.Should().BeNull();
        creditEntry.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Create_ShouldAddDomainEvent_WhenCreditEntryCreated()
    {
        // Arrange & Act
        var creditEntry = CreateTestCreditEntry();

        // Assert
        creditEntry.DomainEvents.Should().NotBeEmpty();
        creditEntry.DomainEvents.Should().ContainSingle(e => e is CreditEntryCreatedEvent);
    }

    [Fact]
    public void Create_ShouldSetIsPaid_WhenPaymentDateProvided()
    {
        // Arrange
        var paymentDate = DateTime.UtcNow;

        // Act
        var creditEntry = CreditEntry.Create(
            "shop123", 
            "Test Shop", 
            "customer456", 
            "Test Customer", 
            "Test Item", 
            100.50m, 
            DateTime.UtcNow, 
            true, 
            paymentDate
        );

        // Assert
        creditEntry.IsPaid.Should().BeTrue();
        creditEntry.PaymentDate.Should().Be(paymentDate);
    }

    [Fact]
    public void Update_ShouldUpdatePaymentStatus_WhenCalled()
    {
        // Arrange
        var creditEntry = CreateTestCreditEntry();
        var paymentDate = DateTime.UtcNow;

        // Act
        creditEntry.Update(true, paymentDate);

        // Assert
        creditEntry.IsPaid.Should().BeTrue();
        creditEntry.PaymentDate.Should().Be(paymentDate);
    }

    [Fact]
    public void Update_ShouldAddDomainEvent_WhenCreditEntryUpdated()
    {
        // Arrange
        var creditEntry = CreateTestCreditEntry();
        var initialEventCount = creditEntry.DomainEvents.Count;

        // Act
        creditEntry.Update(true, DateTime.UtcNow);

        // Assert
        creditEntry.DomainEvents.Should().HaveCount(initialEventCount + 1);
        creditEntry.DomainEvents.Should().Contain(e => e is CreditEntryUpdatedEvent);
    }

    [Fact]
    public void Update_ShouldSetIsPaidToFalse_WhenProvidedFalse()
    {
        // Arrange
        var creditEntry = CreditEntry.Create(
            "shop123", 
            "Test Shop", 
            "customer456", 
            "Test Customer", 
            "Test Item", 
            100.50m, 
            DateTime.UtcNow, 
            true, 
            DateTime.UtcNow
        );

        // Act
        creditEntry.Update(false, DateTime.UtcNow);

        // Assert
        creditEntry.IsPaid.Should().BeFalse();
    }

    [Fact]
    public void Create_ShouldHandleZeroAmount()
    {
        // Arrange & Act
        var creditEntry = CreditEntry.Create(
            "shop123", 
            "Test Shop", 
            "customer456", 
            "Test Customer", 
            "Test Item", 
            0m, 
            DateTime.UtcNow, 
            false, 
            null
        );

        // Assert
        creditEntry.Amount.Should().Be(0m);
    }

    [Fact]
    public void Create_ShouldHandleNegativeAmount()
    {
        // Arrange & Act
        var creditEntry = CreditEntry.Create(
            "shop123", 
            "Test Shop", 
            "customer456", 
            "Test Customer", 
            "Refund Item", 
            -50.25m, 
            DateTime.UtcNow, 
            false, 
            null
        );

        // Assert
        creditEntry.Amount.Should().Be(-50.25m);
    }

    private static CreditEntry CreateTestCreditEntry()
    {
        return CreditEntry.Create(
            "shop123",
            "Test Shop",
            "customer456",
            "Test Customer",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );
    }
}
