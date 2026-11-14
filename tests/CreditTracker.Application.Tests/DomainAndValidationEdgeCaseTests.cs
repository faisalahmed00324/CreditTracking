using BuildingBlocks.Helper;
using CreditTracker.Application.Customers.Commands.CreateUser;
using CreditTracker.Application.Customers.Commands.Login;
using CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Events;
using CreditTracker.Domain.Models;
using FluentValidation.TestHelper;
using Moq;
using Microsoft.Extensions.Configuration;
using System.Linq.Expressions;

namespace CreditTracker.Application.Tests;

public class DomainAndValidationEdgeCaseTests
{
    [Fact]
    public void SuccessfulOtp_CannotBeReused_AndReplacementRequiresNewVerification()
    {
        var user = NewUser();
        Assert.False(user.VerifyOtp("123456"));
        user.SetOtp("123456", DateTime.UtcNow.AddMinutes(10));
        Assert.True(user.VerifyOtp("123456"));
        Assert.False(user.VerifyOtp("123456"));
        user.SetOtp("654321", DateTime.UtcNow.AddMinutes(10));
        Assert.False(user.IsVerified);
        Assert.False(user.VerifyOtp("123456"));
        Assert.True(user.VerifyOtp("654321"));
    }

    [Fact]
    public void UserUpdate_ChangesProfileAndPasswordHash()
    {
        var user = NewUser();
        user.Update("new-hash", "Updated", "New address", "3", "4");
        Assert.Equal("new-hash", user.PasswordHash);
        Assert.Equal("Updated", user.Name);
        Assert.Equal("New address", user.Address);
        Assert.Equal("3", user.Latitude);
        Assert.Equal("4", user.Longitude);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void UserUpdate_RejectsMissingName(string? name)
    {
        Assert.ThrowsAny<ArgumentException>(() => NewUser().Update("hash", name!, "Address", "1", "2"));
    }

    [Fact]
    public void CreditEntry_RecordsAndClearsCreationAndPaymentEvents()
    {
        var entry = CreditEntry.Create("shop", "Shop", "customer", "Customer", "Item", 10m, DateTime.UtcNow, false, null);
        Assert.IsType<CreditEntryCreatedEvent>(Assert.Single(entry.DomainEvents));
        var paymentDate = DateTime.UtcNow;
        entry.Update(true, paymentDate);
        Assert.IsType<CreditEntryUpdatedEvent>(entry.DomainEvents[1]);
        var events = entry.DomainEvents.ToArray();
        Assert.Equal(events, entry.ClearDomainEvents());
        Assert.Empty(entry.DomainEvents);
        Assert.Empty(entry.ClearDomainEvents());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Registration_RequiresIdentityDocument(string? document)
    {
        var user = new UserDto("", "customer", "Password123!", "Customer", document!, Role.Customer,
            "test@example.invalid", "Address", "1", "2");
        new CreateUserCommandValidator().TestValidate(new CreateUserCommand(user))
            .ShouldHaveValidationErrorFor(x => x.User.ICNoOrPassport);
    }

    [Fact]
    public void CreditEntry_RejectsUnspecifiedDate()
    {
        var command = new CreateCreditEntryCommand("shop", "customer", "Item", 10m, default, false, null);
        new CreateCreditEntryValidator().TestValidate(command).ShouldHaveValidationErrorFor(x => x.Date);
    }

    [Fact]
    public async Task Registration_HashesPasswordGeneratesOtpAndForwardsCancellation()
    {
        User? captured = null;
        var users = new Mock<IRepository<User>>();
        users.Setup(x => x.Add(It.IsAny<User>())).Callback<User>(user =>
        {
            captured = user;
            user.Id = "generated-id";
        });
        var unitOfWork = new Mock<IUnitOfWork>();
        using var cancellation = new CancellationTokenSource();
        unitOfWork.Setup(x => x.SaveChangesAsync(cancellation.Token)).ReturnsAsync(1);
        var dto = new UserDto("", "customer", "Password123!", "Customer", "TEST-ID", Role.Customer,
            "test@example.invalid", "Address", "1", "2");
        var before = DateTime.UtcNow;
        var result = await new CreateUserHandler(users.Object, unitOfWork.Object)
            .Handle(new CreateUserCommand(dto), cancellation.Token);
        Assert.NotNull(captured);
        Assert.Equal("generated-id", result.Value.Id);
        Assert.True(PasswordHasher.Verify(dto.Password, captured.PasswordHash));
        Assert.Matches("^[0-9]{6}$", captured.OtpCode);
        Assert.InRange(captured.OtpExpiry, before.AddMinutes(5), DateTime.UtcNow.AddMinutes(5));
        Assert.False(captured.IsVerified);
        unitOfWork.Verify(x => x.SaveChangesAsync(cancellation.Token), Times.Once);
    }

    [Theory]
    [InlineData(false, false)]
    [InlineData(false, true)]
    [InlineData(true, false)]
    public async Task LoginFilter_ExcludesInactiveOrUnverifiedUsers(bool active, bool verified)
    {
        var user = NewUser();
        user.IsActive = active;
        if (verified)
        {
            user.SetOtp("123456", DateTime.UtcNow.AddMinutes(10));
            user.VerifyOtp("123456");
        }
        var users = new Mock<IRepository<User>>();
        users.Setup(x => x.GetSingle(It.IsAny<Expression<Func<User, bool>>>()))
            .Returns<Expression<Func<User, bool>>>(filter => Task.FromResult(filter.Compile()(user) ? user : null!));
        var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64)),
                ["JwtSettings:Issuer"] = "tests", ["JwtSettings:Audience"] = "tests"
            }).Build();
        var handler = new LoginHandler(users.Object, new CreditTracker.Application.Commons.JwtSettings(configuration));
        await Assert.ThrowsAsync<UserNotFoundException>(() => handler.Handle(new LoginCommand(user.UserName, "password"), CancellationToken.None));
    }

    private static User NewUser() => User.Create("customer", "test@example.invalid", "hash", Role.Customer,
        "Customer", "TEST-ID", "Address", "1", "2");
}
