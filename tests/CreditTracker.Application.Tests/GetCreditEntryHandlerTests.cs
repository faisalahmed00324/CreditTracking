using CreditTracker.Application.CreditEntries.Query.GetCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;

namespace CreditTracker.Application.Tests;

public class GetCreditEntryHandlerTests
{
    private readonly Mock<IRepository<CreditEntry>> _repoMock;
    private readonly GetCreditEntryHandler _handler;

    public GetCreditEntryHandlerTests()
    {
        _repoMock = new Mock<IRepository<CreditEntry>>();
        _handler = new GetCreditEntryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingEntry_ReturnsCreditEntryDto()
    {
        // Arrange
        var entry = CreditEntry.Create("shopId", "Shop", "custId", "Customer", "Widget", 50.0m, DateTime.UtcNow, false, null);
        entry.Id = "entryId";
        _repoMock.Setup(r => r.GetById("entryId")).ReturnsAsync(entry);

        var query = new GetCreditEntryQuery("entryId");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.CreditEntry.Should().NotBeNull();
        result.Value.CreditEntry.Item.Should().Be("Widget");
    }

    [Fact]
    public async Task Handle_NonExistentEntry_ThrowsCreditEntryNotFoundException()
    {
        // Arrange
        _repoMock.Setup(r => r.GetById("nonexistent")).ReturnsAsync((CreditEntry?)null);
        var query = new GetCreditEntryQuery("nonexistent");

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(query, CancellationToken.None))
            .Should().ThrowAsync<CreditEntryNotFoundException>();
    }
}
