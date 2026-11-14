using System.Linq.Expressions;
using BuildingBlocks.Pagination;
using CreditTracker.Application.Commons;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByCustomer;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByShop;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using Moq;

namespace CreditTracker.Application.Tests;

public class PaginationFilterTests
{
    [Theory]
    [InlineData(true, false)]
    [InlineData(false, false)]
    [InlineData(true, true)]
    [InlineData(false, true)]
    public async Task Listings_UseMatchingActiveFiltersAndCorrectOffset(bool byCustomer, bool nullResults)
    {
        var owner = CreditEntry.Create("shop", "Shop", "customer", "Customer", "Owned", 10m, DateTime.UtcNow, false, null);
        var foreign = CreditEntry.Create("other-shop", "Shop", "other-customer", "Customer", "Foreign", 10m, DateTime.UtcNow, false, null);
        var deleted = CreditEntry.Create("shop", "Shop", "customer", "Customer", "Deleted", 10m, DateTime.UtcNow, false, null);
        deleted.Remove();
        var data = new[] { owner, foreign, deleted };
        Expression<Func<CreditEntry, bool>>? countFilter = null;
        Expression<Func<CreditEntry, bool>>? pageFilter = null;
        var repository = new Mock<IRepository<CreditEntry>>(MockBehavior.Strict);
        repository.Setup(x => x.CountAsync(It.IsAny<Expression<Func<CreditEntry, bool>>>()))
            .Callback<Expression<Func<CreditEntry, bool>>>(filter => countFilter = filter).ReturnsAsync(1);
        repository.Setup(x => x.GetByFilterWithPagination(It.IsAny<Expression<Func<CreditEntry, bool>>>(), 2, 4))
            .Callback<Expression<Func<CreditEntry, bool>>, int, int>((filter, _, _) => pageFilter = filter)
            .ReturnsAsync(nullResults ? null! : [owner]);

        if (byCustomer)
        {
            await new GetCreditEntriesByCustomerHandler(repository.Object, new TestCurrentUser("customer"))
                .Handle(new GetCreditEntriesByCustomerQuery(new PaginationRequest(3, 2), "customer"), CancellationToken.None);
        }
        else
        {
            await new GetCreditEntriesByShopHandler(repository.Object, new TestCurrentUser("shop"))
                .Handle(new GetCreditEntriesByShopQuery(new PaginationRequest(3, 2), "shop"), CancellationToken.None);
        }

        Assert.NotNull(countFilter);
        Assert.NotNull(pageFilter);
        Assert.Equal(new[] { owner }, data.Where(countFilter.Compile()).ToArray());
        Assert.Equal(new[] { owner }, data.Where(pageFilter.Compile()).ToArray());
        repository.VerifyAll();
    }

    private sealed record TestCurrentUser(string? UserId) : ICurrentUserService;
}
