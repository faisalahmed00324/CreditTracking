using BuildingBlocks.Behaviors;
using BuildingBlocks.CQRS;
using FluentValidation;

namespace CreditTracker.Application.Tests;

public class ValidationBehaviorTests
{
    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ValidRequest_InvokesNextExactlyOnce(bool hasValidator)
    {
        var validator = new InlineValidator<TestCommand>();
        validator.RuleFor(x => x.Name).NotEmpty();
        var behavior = new ValidationBehavior<TestCommand, string>(hasValidator ? [validator] : []);
        var calls = 0;
        var result = await behavior.Handle(new TestCommand("valid"), _ =>
        {
            calls++;
            return Task.FromResult("handled");
        }, CancellationToken.None);
        Assert.Equal("handled", result);
        Assert.Equal(1, calls);
    }

    [Fact]
    public async Task InvalidRequest_AggregatesFailuresAndNeverInvokesNext()
    {
        var first = new InlineValidator<TestCommand>();
        first.RuleFor(x => x.Name).NotEmpty();
        var second = new InlineValidator<TestCommand>();
        second.RuleFor(x => x.Name).MinimumLength(3);
        var behavior = new ValidationBehavior<TestCommand, string>([first, second]);
        var called = false;
        var exception = await Assert.ThrowsAsync<ValidationException>(() => behavior.Handle(
            new TestCommand(""), _ => { called = true; return Task.FromResult("unexpected"); }, CancellationToken.None));
        Assert.Equal(2, exception.Errors.Count());
        Assert.False(called);
    }

    [Fact]
    public async Task Cancellation_IsPassedToAsyncValidators()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var validator = new InlineValidator<TestCommand>();
        validator.RuleFor(x => x.Name).MustAsync((_, token) =>
        {
            token.ThrowIfCancellationRequested();
            return Task.FromResult(true);
        });
        var behavior = new ValidationBehavior<TestCommand, string>([validator]);
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => behavior.Handle(new TestCommand("valid"),
            _ => throw new InvalidOperationException("Handler must not run"), cancellation.Token));
    }

    public sealed record TestCommand(string Name) : ICommand<string>;
}
