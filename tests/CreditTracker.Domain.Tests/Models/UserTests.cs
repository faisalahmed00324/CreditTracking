using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Xunit;

namespace CreditTracker.Domain.Tests.Models;

public class UserTests
{
    [Fact]
    public void Create_ShouldReturnUser_WhenValidDataProvided()
    {
        // Arrange
        var userName = "testuser";
        var email = "test@example.com";
        var passwordHash = "hashedPassword123";
        var role = Role.Customer;
        var name = "Test User";
        var icNo = "123456789";
        var address = "123 Test St";
        var latitude = "1.23456";
        var longitude = "103.45678";

        // Act
        var user = User.Create(userName, email, passwordHash, role, name, icNo, address, latitude, longitude);

        // Assert
        user.Should().NotBeNull();
        user.UserName.Should().Be(userName);
        user.Email.Should().Be(email);
        user.PasswordHash.Should().Be(passwordHash);
        user.Role.Should().Be(role);
        user.Name.Should().Be(name);
        user.ICNoOrPassport.Should().Be(icNo);
        user.Address.Should().Be(address);
        user.Latitude.Should().Be(latitude);
        user.Longitude.Should().Be(longitude);
        user.IsActive.Should().BeTrue();
    }

    [Fact]
    public void SetOtp_ShouldSetOtpCodeAndExpiry()
    {
        // Arrange
        var user = CreateTestUser();
        var otpCode = "123456";
        var otpExpiry = DateTime.UtcNow.AddMinutes(5);

        // Act
        user.SetOtp(otpCode, otpExpiry);

        // Assert
        user.OtpCode.Should().Be(otpCode);
        user.OtpExpiry.Should().Be(otpExpiry);
        user.IsVerified.Should().BeFalse();
    }

    [Fact]
    public void VerifyOtp_ShouldReturnTrue_WhenOtpIsValidAndNotExpired()
    {
        // Arrange
        var user = CreateTestUser();
        var otpCode = "123456";
        var otpExpiry = DateTime.UtcNow.AddMinutes(5);
        user.SetOtp(otpCode, otpExpiry);

        // Act
        var result = user.VerifyOtp(otpCode);

        // Assert
        result.Should().BeTrue();
        user.IsVerified.Should().BeTrue();
        user.OtpCode.Should().BeNull();
    }

    [Fact]
    public void VerifyOtp_ShouldReturnFalse_WhenOtpIsIncorrect()
    {
        // Arrange
        var user = CreateTestUser();
        var correctOtp = "123456";
        var incorrectOtp = "999999";
        var otpExpiry = DateTime.UtcNow.AddMinutes(5);
        user.SetOtp(correctOtp, otpExpiry);

        // Act
        var result = user.VerifyOtp(incorrectOtp);

        // Assert
        result.Should().BeFalse();
        user.IsVerified.Should().BeFalse();
        user.OtpCode.Should().Be(correctOtp);
    }

    [Fact]
    public void VerifyOtp_ShouldReturnFalse_WhenOtpIsExpired()
    {
        // Arrange
        var user = CreateTestUser();
        var otpCode = "123456";
        var otpExpiry = DateTime.UtcNow.AddMinutes(-1); // Expired
        user.SetOtp(otpCode, otpExpiry);

        // Act
        var result = user.VerifyOtp(otpCode);

        // Assert
        result.Should().BeFalse();
        user.IsVerified.Should().BeFalse();
        user.OtpCode.Should().Be(otpCode);
    }

    [Fact]
    public void Update_ShouldUpdateUserProperties()
    {
        // Arrange
        var user = CreateTestUser();
        var newPasswordHash = "newHashedPassword";
        var newName = "Updated Name";
        var newAddress = "456 New St";
        var newLatitude = "2.34567";
        var newLongitude = "104.56789";

        // Act
        user.Update(newPasswordHash, newName, newAddress, newLatitude, newLongitude);

        // Assert
        user.PasswordHash.Should().Be(newPasswordHash);
        user.Name.Should().Be(newName);
        user.Address.Should().Be(newAddress);
        user.Latitude.Should().Be(newLatitude);
        user.Longitude.Should().Be(newLongitude);
    }

    [Fact]
    public void Update_ShouldThrowException_WhenNameIsNull()
    {
        // Arrange
        var user = CreateTestUser();

        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => 
            user.Update("password", null!, "address", "lat", "long"));
    }

    [Fact]
    public void Update_ShouldThrowException_WhenNameIsEmpty()
    {
        // Arrange
        var user = CreateTestUser();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => 
            user.Update("password", "", "address", "lat", "long"));
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
