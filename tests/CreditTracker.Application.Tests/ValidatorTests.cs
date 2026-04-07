using CreditTracker.Application.Customers.Commands.CreateUser;
using CreditTracker.Application.Customers.Commands.Login;
using CreditTracker.Application.Customers.Commands.VerifyOtp;
using CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Enum;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace CreditTracker.Application.Tests;

public class CreateUserCommandValidatorTests
{
    private readonly CreateUserCommandValidator _validator = new();

    [Fact]
    public void ValidCommand_PassesValidation()
    {
        var dto = new UserDto("", "user1", "Pass123!", "Test User", "IC123", Role.Customer, "test@email.com", "Addr", "1", "2");
        var result = _validator.TestValidate(new CreateUserCommand(dto));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyName_FailsValidation()
    {
        var dto = new UserDto("", "user1", "Pass123!", "", "IC123", Role.Customer, "test@email.com", "Addr", "1", "2");
        var result = _validator.TestValidate(new CreateUserCommand(dto));
        result.ShouldHaveValidationErrorFor(x => x.User.Name);
    }

    [Fact]
    public void EmptyUserName_FailsValidation()
    {
        var dto = new UserDto("", "", "Pass123!", "Name", "IC123", Role.Customer, "test@email.com", "Addr", "1", "2");
        var result = _validator.TestValidate(new CreateUserCommand(dto));
        result.ShouldHaveValidationErrorFor(x => x.User.UserName);
    }

    [Fact]
    public void EmptyPassword_FailsValidation()
    {
        var dto = new UserDto("", "user1", "", "Name", "IC123", Role.Customer, "test@email.com", "Addr", "1", "2");
        var result = _validator.TestValidate(new CreateUserCommand(dto));
        result.ShouldHaveValidationErrorFor(x => x.User.Password);
    }

    [Fact]
    public void ShopRole_FailsValidation()
    {
        var dto = new UserDto("", "user1", "Pass123!", "Name", "IC123", Role.Shop, "test@email.com", "Addr", "1", "2");
        var result = _validator.TestValidate(new CreateUserCommand(dto));
        result.ShouldHaveValidationErrorFor(x => x.User.Role);
    }
}

public class LoginCommandValidatorTests
{
    private readonly LoginCommandValidator _validator = new();

    [Fact]
    public void ValidCommand_PassesValidation()
    {
        var result = _validator.TestValidate(new LoginCommand("user1", "pass"));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyUserName_FailsValidation()
    {
        var result = _validator.TestValidate(new LoginCommand("", "pass"));
        result.ShouldHaveValidationErrorFor(x => x.UserName);
    }

    [Fact]
    public void EmptyPassword_FailsValidation()
    {
        var result = _validator.TestValidate(new LoginCommand("user1", ""));
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}

public class VerifyOtpCommandValidatorTests
{
    private readonly VerifyOtpCommandValidator _validator = new();

    [Fact]
    public void ValidCommand_PassesValidation()
    {
        var result = _validator.TestValidate(new VerifyOtpCommand("id1", "123456"));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyId_FailsValidation()
    {
        var result = _validator.TestValidate(new VerifyOtpCommand("", "123456"));
        result.ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Fact]
    public void EmptyOtp_FailsValidation()
    {
        var result = _validator.TestValidate(new VerifyOtpCommand("id1", ""));
        result.ShouldHaveValidationErrorFor(x => x.Otp);
    }
}

public class CreateCreditEntryValidatorTests
{
    private readonly CreateCreditEntryValidator _validator = new();

    [Fact]
    public void ValidCommand_PassesValidation()
    {
        var cmd = new CreateCreditEntryCommand("shopId", "custId", "Widget", 50.0m, DateTime.UtcNow, false, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyItem_FailsValidation()
    {
        var cmd = new CreateCreditEntryCommand("shopId", "custId", "", 50.0m, DateTime.UtcNow, false, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Item);
    }

    [Fact]
    public void ZeroAmount_FailsValidation()
    {
        var cmd = new CreateCreditEntryCommand("shopId", "custId", "Widget", 0, DateTime.UtcNow, false, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void NegativeAmount_FailsValidation()
    {
        var cmd = new CreateCreditEntryCommand("shopId", "custId", "Widget", -10, DateTime.UtcNow, false, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void EmptyShopId_FailsValidation()
    {
        var cmd = new CreateCreditEntryCommand("", "custId", "Widget", 50.0m, DateTime.UtcNow, false, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.ShopId);
    }

    [Fact]
    public void EmptyCustomerId_FailsValidation()
    {
        var cmd = new CreateCreditEntryCommand("shopId", "", "Widget", 50.0m, DateTime.UtcNow, false, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.CustomerId);
    }
}
