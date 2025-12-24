using BuildingBlocks.Helper;
using FluentAssertions;
using Xunit;

namespace BuildingBlocks.Tests.Helper;

public class PasswordHasherTests
{
    [Fact]
    public void Hash_ShouldReturnHashedPassword_WhenValidPasswordProvided()
    {
        // Arrange
        var password = "TestPassword123!";

        // Act
        var hashedPassword = PasswordHasher.Hash(password);

        // Assert
        hashedPassword.Should().NotBeNullOrEmpty();
        hashedPassword.Should().NotBe(password);
    }

    [Fact]
    public void Hash_ShouldReturnDifferentHashes_ForSamePassword()
    {
        // Arrange
        var password = "TestPassword123!";

        // Act
        var hash1 = PasswordHasher.Hash(password);
        var hash2 = PasswordHasher.Hash(password);

        // Assert
        hash1.Should().NotBe(hash2, "each hash should use a different salt");
    }

    [Fact]
    public void Verify_ShouldReturnTrue_WhenPasswordMatches()
    {
        // Arrange
        var password = "TestPassword123!";
        var hashedPassword = PasswordHasher.Hash(password);

        // Act
        var result = PasswordHasher.Verify(password, hashedPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Verify_ShouldReturnFalse_WhenPasswordDoesNotMatch()
    {
        // Arrange
        var correctPassword = "TestPassword123!";
        var incorrectPassword = "WrongPassword456!";
        var hashedPassword = PasswordHasher.Hash(correctPassword);

        // Act
        var result = PasswordHasher.Verify(incorrectPassword, hashedPassword);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Verify_ShouldThrowException_WhenHashIsInvalid()
    {
        // Arrange
        var password = "TestPassword123!";
        var invalidHash = "InvalidHashString";

        // Act & Assert
        Assert.Throws<FormatException>(() => PasswordHasher.Verify(password, invalidHash));
    }

    [Theory]
    [InlineData("")]
    [InlineData("a")]
    [InlineData("VeryLongPasswordThatShouldStillWorkCorrectlyWithTheHashingAlgorithm123456789!@#$%^&*()")]
    public void Hash_And_Verify_ShouldWork_WithVariousPasswordLengths(string password)
    {
        // Arrange & Act
        var hashedPassword = PasswordHasher.Hash(password);
        var result = PasswordHasher.Verify(password, hashedPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Hash_ShouldWorkWithSpecialCharacters()
    {
        // Arrange
        var password = "P@ssw0rd!#$%^&*()_+-=[]{}|;':\",./<>?";

        // Act
        var hashedPassword = PasswordHasher.Hash(password);
        var result = PasswordHasher.Verify(password, hashedPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Hash_ShouldWorkWithUnicodeCharacters()
    {
        // Arrange
        var password = "パスワード123";

        // Act
        var hashedPassword = PasswordHasher.Hash(password);
        var result = PasswordHasher.Verify(password, hashedPassword);

        // Assert
        result.Should().BeTrue();
    }
}
