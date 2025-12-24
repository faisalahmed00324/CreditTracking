using CreditTracker.Application.Customers.Commands.CreateUser;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Enum;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

namespace CreditTracker.Application.Tests.Validators;

public class CreateUserCommandValidatorTests
{
    private readonly CreateUserCommandValidator _validator;

    public CreateUserCommandValidatorTests()
    {
        _validator = new CreateUserCommandValidator();
    }

    [Fact]
    public void Validate_ShouldPass_WhenAllFieldsAreValid()
    {
        // Arrange
        var command = new CreateUserCommand(new UserDto(
            "",
            "testuser",
            "TestPassword123!",
            "Test User",
            "123456789",
            Role.Customer,
            "test@example.com",
            "123 Test St",
            "1.23456",
            "103.45678"
        ));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_ShouldFail_WhenNameIsEmpty()
    {
        // Arrange
        var command = new CreateUserCommand(new UserDto(
            "",
            "testuser",
            "TestPassword123!",
            "",
            "123456789",
            Role.Customer,
            "test@example.com",
            "123 Test St",
            "1.23456",
            "103.45678"
        ));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.User.Name)
            .WithErrorMessage("Name is required");
    }

    [Fact]
    public void Validate_ShouldFail_WhenUserNameIsEmpty()
    {
        // Arrange
        var command = new CreateUserCommand(new UserDto(
            "",
            "",
            "TestPassword123!",
            "Test User",
            "123456789",
            Role.Customer,
            "test@example.com",
            "123 Test St",
            "1.23456",
            "103.45678"
        ));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.User.UserName)
            .WithErrorMessage("UserName is required");
    }

    [Fact]
    public void Validate_ShouldFail_WhenICNoOrPassportIsEmpty()
    {
        // Arrange
        var command = new CreateUserCommand(new UserDto(
            "",
            "testuser",
            "TestPassword123!",
            "Test User",
            "",
            Role.Customer,
            "test@example.com",
            "123 Test St",
            "1.23456",
            "103.45678"
        ));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.User.ICNoOrPassport)
            .WithErrorMessage("IC or passport is required");
    }

    [Fact]
    public void Validate_ShouldFail_WhenPasswordIsEmpty()
    {
        // Arrange
        var command = new CreateUserCommand(new UserDto(
            "",
            "testuser",
            "",
            "Test User",
            "123456789",
            Role.Customer,
            "test@example.com",
            "123 Test St",
            "1.23456",
            "103.45678"
        ));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.User.Password)
            .WithErrorMessage("Password is required");
    }

    [Fact]
    public void Validate_ShouldFail_WhenRoleIsNotCustomer()
    {
        // Arrange
        var command = new CreateUserCommand(new UserDto(
            "",
            "testuser",
            "TestPassword123!",
            "Test User",
            "123456789",
            Role.Shop,
            "test@example.com",
            "123 Test St",
            "1.23456",
            "103.45678"
        ));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.User.Role)
            .WithErrorMessage("Only Customer role is allowed.");
    }
}
