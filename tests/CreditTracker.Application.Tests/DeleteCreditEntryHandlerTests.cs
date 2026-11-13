using CreditTracker.Application.CreditEntries.Commands.DeleteCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;

namespace CreditTracker.Application.Tests;

public class DeleteCreditEntryHandlerTests
{
    private readonly Mock<IRepository<CreditEntry>> _repoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly DeleteCreditEntryHandler _handler;

    public DeleteCreditEntryHandlerTests()
    {
        _repoMock = new Mock<IRepository<CreditEntry>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new DeleteCreditEntryHandler(_repoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingEntry_SoftDeletesAndReturnsSuccess()
    {
        // Arrange
        var entry = CreditEntry.Create("shopId", "Shop", "custId", "Customer", "Widget", 50.0m, DateTime.UtcNow, false, null);
        _repoMock.Setup(r => r.GetById("entryId")).ReturnsAsync(entry);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var command = new DeleteCreditEntryCommand("entryId");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsSuccess.Should().BeTrue();
        entry.IsActive.Should().BeFalse();
        _repoMock.Verify(r => r.Update(It.IsAny<CreditEntry>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NonExistentEntry_ThrowsCreditEntryNotFoundException()
    {
        // Arrange
        _repoMock.Setup(r => r.GetById("nonexistent")).ReturnsAsync((CreditEntry?)null);
        var command = new DeleteCreditEntryCommand("nonexistent");

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<CreditEntryNotFoundException>();
    }
}
