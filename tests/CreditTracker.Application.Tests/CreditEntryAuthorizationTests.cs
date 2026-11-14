using BuildingBlocks.Exceptions;
using BuildingBlocks.Pagination;
using CreditTracker.Application.Commons;
using CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry;
using CreditTracker.Application.CreditEntries.Commands.DeleteCreditEntry;
using CreditTracker.Application.CreditEntries.Commands.UpdateCreditEntry;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByCustomer;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByShop;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;
using Moq;

namespace CreditTracker.Application.Tests;

public class CreditEntryAuthorizationTests
{
    public static IEnumerable<object?[]> UnauthorizedCases()
    {
        foreach (var operation in new[] { "create", "read", "update", "delete", "shop-list", "customer-list" })
        {
            foreach (var userId in new string?[] { null, "", "unrelated-user" })
            {
                yield return [operation, userId];
            }
        }
    }

    [Theory]
    [MemberData(nameof(UnauthorizedCases))]
    public async Task UnauthorizedOperations_RejectAccessWithoutWriting(string operation, string? userId)
    {
        var repository = new Mock<IRepository<CreditEntry>>();
        repository.Setup(x => x.GetById("entry")).ReturnsAsync(NewEntry());
        var users = new Mock<IRepository<User>>(MockBehavior.Strict);
        var unitOfWork = new Mock<IUnitOfWork>(MockBehavior.Strict);
        var current = new TestCurrentUser(userId);

        await Assert.ThrowsAsync<ForbiddenException>(() => RunAsync(operation, repository.Object,
            users.Object, unitOfWork.Object, current));

        repository.Verify(x => x.Add(It.IsAny<CreditEntry>()), Times.Never);
        repository.Verify(x => x.Update(It.IsAny<CreditEntry>()), Times.Never);
        users.VerifyNoOtherCalls();
        unitOfWork.VerifyNoOtherCalls();
    }

    [Theory]
    [InlineData("shop")]
    [InlineData("customer")]
    public async Task Read_AllowsEitherParticipant(string userId)
    {
        var repository = new Mock<IRepository<CreditEntry>>();
        repository.Setup(x => x.GetById("entry")).ReturnsAsync(NewEntry());
        var handler = new GetCreditEntryHandler(repository.Object, new TestCurrentUser(userId));
        var result = await handler.Handle(new GetCreditEntryQuery("entry"), CancellationToken.None);
        Assert.True(result.IsSuccess);
    }

    [Theory]
    [InlineData("read")]
    [InlineData("update")]
    [InlineData("delete")]
    public async Task DeletedEntries_AreNotReadableOrWritable(string operation)
    {
        var repository = new Mock<IRepository<CreditEntry>>();
        var entry = NewEntry();
        entry.Remove();
        repository.Setup(x => x.GetById("entry")).ReturnsAsync(entry);
        var unitOfWork = new Mock<IUnitOfWork>(MockBehavior.Strict);
        await Assert.ThrowsAsync<CreditEntryNotFoundException>(() => RunAsync(operation, repository.Object,
            Mock.Of<IRepository<User>>(), unitOfWork.Object, new TestCurrentUser("shop")));
        repository.Verify(x => x.Update(It.IsAny<CreditEntry>()), Times.Never);
        unitOfWork.VerifyNoOtherCalls();
    }

    [Theory]
    [InlineData("update")]
    [InlineData("delete")]
    public async Task Writes_ForwardCancellationAndPropagateSaveFailures(string operation)
    {
        var repository = new Mock<IRepository<CreditEntry>>();
        repository.Setup(x => x.GetById("entry")).ReturnsAsync(NewEntry());
        using var cancellation = new CancellationTokenSource();
        var error = new InvalidOperationException("Test database failure");
        var unitOfWork = new Mock<IUnitOfWork>(MockBehavior.Strict);
        unitOfWork.Setup(x => x.SaveChangesAsync(cancellation.Token)).ThrowsAsync(error);
        var actual = await Assert.ThrowsAsync<InvalidOperationException>(() => RunAsync(operation,
            repository.Object, Mock.Of<IRepository<User>>(), unitOfWork.Object,
            new TestCurrentUser("shop"), cancellation.Token));
        Assert.Same(error, actual);
        unitOfWork.Verify(x => x.SaveChangesAsync(cancellation.Token), Times.Once);
    }

    private static Task RunAsync(string operation, IRepository<CreditEntry> entries, IRepository<User> users,
        IUnitOfWork unitOfWork, ICurrentUserService current, CancellationToken token = default) => operation switch
    {
        "create" => new CreateCreditEntryHandler(entries, users, unitOfWork, current)
            .Handle(new CreateCreditEntryCommand("shop", "customer", "Item", 10m, DateTime.UtcNow, false, null), token),
        "read" => new GetCreditEntryHandler(entries, current).Handle(new GetCreditEntryQuery("entry"), token),
        "update" => new UpdateCreditEntryHandler(entries, unitOfWork, current)
            .Handle(new UpdateCreditEntryCommand("entry", true, DateTime.UtcNow), token),
        "delete" => new DeleteCreditEntryHandler(entries, unitOfWork, current).Handle(new DeleteCreditEntryCommand("entry"), token),
        "shop-list" => new GetCreditEntriesByShopHandler(entries, current)
            .Handle(new GetCreditEntriesByShopQuery(new PaginationRequest(1, 10), "shop"), token),
        "customer-list" => new GetCreditEntriesByCustomerHandler(entries, current)
            .Handle(new GetCreditEntriesByCustomerQuery(new PaginationRequest(1, 10), "customer"), token),
        _ => throw new ArgumentOutOfRangeException(nameof(operation))
    };

    private static CreditEntry NewEntry() => CreditEntry.Create("shop", "Shop", "customer", "Customer",
        "Item", 10m, DateTime.UtcNow, false, null);

    private sealed record TestCurrentUser(string? UserId) : ICurrentUserService;
}
