using CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

namespace CreditTracker.Application.Tests.Validators;

public class CreateCreditEntryValidatorTests
{
    private readonly CreateCreditEntryValidator _validator;

    public CreateCreditEntryValidatorTests()
    {
        _validator = new CreateCreditEntryValidator();
    }

    [Fact]
    public void Validate_ShouldPass_WhenAllFieldsAreValid()
    {
        // Arrange
        var command = new CreateCreditEntryCommand(
            "shop123",
            "customer456",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_ShouldFail_WhenItemIsEmpty()
    {
        // Arrange
        var command = new CreateCreditEntryCommand(
            "shop123",
            "customer456",
            "",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Item)
            .WithErrorMessage("Item is required");
    }

    [Fact]
    public void Validate_ShouldFail_WhenAmountIsZero()
    {
        // Arrange
        var command = new CreateCreditEntryCommand(
            "shop123",
            "customer456",
            "Test Item",
            0m,
            DateTime.UtcNow,
            false,
            null
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Amount)
            .WithErrorMessage("Amount is required");
    }

    [Fact]
    public void Validate_ShouldFail_WhenAmountIsNegative()
    {
        // Arrange
        var command = new CreateCreditEntryCommand(
            "shop123",
            "customer456",
            "Test Item",
            -10m,
            DateTime.UtcNow,
            false,
            null
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Validate_ShouldFail_WhenShopIdIsEmpty()
    {
        // Arrange
        var command = new CreateCreditEntryCommand(
            "",
            "customer456",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ShopId)
            .WithErrorMessage("ShopId is required");
    }

    [Fact]
    public void Validate_ShouldFail_WhenCustomerIdIsEmpty()
    {
        // Arrange
        var command = new CreateCreditEntryCommand(
            "shop123",
            "",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CustomerId)
            .WithErrorMessage("Customer Id is required");
    }
}
