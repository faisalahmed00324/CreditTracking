using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByShop;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using BuildingBlocks.Pagination;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;

namespace CreditTracker.Application.Tests;

public class GetCreditEntriesByShopHandlerTests
{
    private readonly Mock<IRepository<CreditEntry>> _repoMock;
    private readonly GetCreditEntriesByShopHandler _handler;

    public GetCreditEntriesByShopHandlerTests()
    {
        _repoMock = new Mock<IRepository<CreditEntry>>();
        _handler = new GetCreditEntriesByShopHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_WithEntries_ReturnsPaginatedResults()
    {
        // Arrange
        var entries = new List<CreditEntry>
        {
            CreditEntry.Create("shopId", "Shop", "custId", "Customer", "Widget", 50.0m, DateTime.UtcNow, false, null)
        };
        _repoMock.Setup(r => r.CountAsync(It.IsAny<Expression<Func<CreditEntry, bool>>>())).ReturnsAsync(1);
        _repoMock.Setup(r => r.GetByFilterWithPagination(It.IsAny<Expression<Func<CreditEntry, bool>>>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(entries);

        var query = new GetCreditEntriesByShopQuery(new PaginationRequest(1, 10), "shopId");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.CreditEntries.Data.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_NoEntries_ReturnsNoContent()
    {
        // Arrange
        _repoMock.Setup(r => r.CountAsync(It.IsAny<Expression<Func<CreditEntry, bool>>>())).ReturnsAsync(0);
        _repoMock.Setup(r => r.GetByFilterWithPagination(It.IsAny<Expression<Func<CreditEntry, bool>>>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(new List<CreditEntry>());

        var query = new GetCreditEntriesByShopQuery(new PaginationRequest(1, 10), "shopId");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Status.Should().Be(Ardalis.Result.ResultStatus.NoContent);
    }
}
