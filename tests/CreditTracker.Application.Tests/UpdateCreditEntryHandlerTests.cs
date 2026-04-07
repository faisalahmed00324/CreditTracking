using CreditTracker.Application.CreditEntries.Commands.UpdateCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;

namespace CreditTracker.Application.Tests;

public class UpdateCreditEntryHandlerTests
{
    private readonly Mock<IRepository<CreditEntry>> _repoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly UpdateCreditEntryHandler _handler;

    public UpdateCreditEntryHandlerTests()
    {
        _repoMock = new Mock<IRepository<CreditEntry>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new UpdateCreditEntryHandler(_repoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingEntry_UpdatesAndReturnsSuccess()
    {
        // Arrange
        var entry = CreditEntry.Create("shopId", "Shop", "custId", "Customer", "Widget", 50.0m, DateTime.UtcNow, false, null);
        _repoMock.Setup(r => r.GetById("entryId")).ReturnsAsync(entry);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var command = new UpdateCreditEntryCommand("entryId", true, DateTime.UtcNow);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsSuccess.Should().BeTrue();
        _repoMock.Verify(r => r.Update(It.IsAny<CreditEntry>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NonExistentEntry_ThrowsCreditEntryNotFoundException()
    {
        // Arrange
        _repoMock.Setup(r => r.GetById("nonexistent")).ReturnsAsync((CreditEntry?)null);
        var command = new UpdateCreditEntryCommand("nonexistent", true, DateTime.UtcNow);

        // Act & Assert
        await FluentActions.Invoking(() => _handler.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<CreditEntryNotFoundException>();
    }
}
