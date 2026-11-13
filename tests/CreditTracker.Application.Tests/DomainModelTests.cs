using CreditTracker.Domain.Models;
using CreditTracker.Domain.Enum;
using FluentAssertions;

namespace CreditTracker.Application.Tests;

public class UserDomainTests
{
    [Fact]
    public void Create_SetsAllPropertiesCorrectly()
    {
        var user = User.Create("testuser", "test@email.com", "hash", Role.Customer, "Test", "IC123", "Addr", "1.0", "2.0");
        user.UserName.Should().Be("testuser");
        user.Email.Should().Be("test@email.com");
        user.Role.Should().Be(Role.Customer);
        user.IsActive.Should().BeTrue();
        user.IsVerified.Should().BeFalse();
    }

    [Fact]
    public void SetOtp_SetsCodeAndExpiry()
    {
        var user = User.Create("testuser", "test@email.com", "hash", Role.Customer, "Test", "IC123", "Addr", "1", "2");
        var expiry = DateTime.UtcNow.AddMinutes(5);
        user.SetOtp("123456", expiry);
        user.OtpCode.Should().Be("123456");
        user.OtpExpiry.Should().Be(expiry);
        user.IsVerified.Should().BeFalse();
    }

    [Fact]
    public void VerifyOtp_ValidOtp_ReturnsTrue()
    {
        var user = User.Create("testuser", "test@email.com", "hash", Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.SetOtp("123456", DateTime.UtcNow.AddMinutes(5));
        var result = user.VerifyOtp("123456");
        result.Should().BeTrue();
        user.IsVerified.Should().BeTrue();
        user.OtpCode.Should().BeNull();
    }

    [Fact]
    public void VerifyOtp_InvalidCode_ReturnsFalse()
    {
        var user = User.Create("testuser", "test@email.com", "hash", Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.SetOtp("123456", DateTime.UtcNow.AddMinutes(5));
        var result = user.VerifyOtp("000000");
        result.Should().BeFalse();
        user.IsVerified.Should().BeFalse();
    }

    [Fact]
    public void VerifyOtp_ExpiredOtp_ReturnsFalse()
    {
        var user = User.Create("testuser", "test@email.com", "hash", Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.SetOtp("123456", DateTime.UtcNow.AddMinutes(-1));
        var result = user.VerifyOtp("123456");
        result.Should().BeFalse();
    }

    [Fact]
    public void Remove_SetsIsActiveFalse()
    {
        var user = User.Create("testuser", "test@email.com", "hash", Role.Customer, "Test", "IC123", "Addr", "1", "2");
        user.IsActive.Should().BeTrue();
        user.Remove();
        user.IsActive.Should().BeFalse();
    }
}

public class CreditEntryDomainTests
{
    [Fact]
    public void Create_SetsAllPropertiesCorrectly()
    {
        var date = DateTime.UtcNow;
        var entry = CreditEntry.Create("shopId", "Shop", "custId", "Customer", "Widget", 50.0m, date, false, null);
        entry.ShopId.Should().Be("shopId");
        entry.ShopName.Should().Be("Shop");
        entry.CustomerId.Should().Be("custId");
        entry.CustomerName.Should().Be("Customer");
        entry.Item.Should().Be("Widget");
        entry.Amount.Should().Be(50.0m);
        entry.IsPaid.Should().BeFalse();
        entry.PaymentDate.Should().BeNull();
        entry.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Update_SetsIsPaidAndPaymentDate()
    {
        var entry = CreditEntry.Create("shopId", "Shop", "custId", "Customer", "Widget", 50.0m, DateTime.UtcNow, false, null);
        var paymentDate = DateTime.UtcNow;
        entry.Update(true, paymentDate);
        entry.IsPaid.Should().BeTrue();
        entry.PaymentDate.Should().Be(paymentDate);
    }

    [Fact]
    public void Remove_SetsIsActiveFalse()
    {
        var entry = CreditEntry.Create("shopId", "Shop", "custId", "Customer", "Widget", 50.0m, DateTime.UtcNow, false, null);
        entry.IsActive.Should().BeTrue();
        entry.Remove();
        entry.IsActive.Should().BeFalse();
    }
}

public class PasswordHasherTests
{
    [Fact]
    public void Hash_ReturnsNonEmptyString()
    {
        var hash = BuildingBlocks.Helper.PasswordHasher.Hash("password123");
        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = BuildingBlocks.Helper.PasswordHasher.Hash("password123");
        var result = BuildingBlocks.Helper.PasswordHasher.Verify("password123", hash);
        result.Should().BeTrue();
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = BuildingBlocks.Helper.PasswordHasher.Hash("password123");
        var result = BuildingBlocks.Helper.PasswordHasher.Verify("wrongpassword", hash);
        result.Should().BeFalse();
    }

    [Fact]
    public void Hash_DifferentCalls_ProduceDifferentHashes()
    {
        var hash1 = BuildingBlocks.Helper.PasswordHasher.Hash("password123");
        var hash2 = BuildingBlocks.Helper.PasswordHasher.Hash("password123");
        hash1.Should().NotBe(hash2); // Different salts
    }
}
