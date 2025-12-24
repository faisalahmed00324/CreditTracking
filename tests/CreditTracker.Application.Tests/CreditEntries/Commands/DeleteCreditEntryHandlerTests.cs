using Ardalis.Result;
using CreditTracker.Application.CreditEntries.Commands.DeleteCreditEntry;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using FluentAssertions;
using Moq;
using Xunit;

namespace CreditTracker.Application.Tests.CreditEntries.Commands;

public class DeleteCreditEntryHandlerTests
{
    private readonly Mock<IRepository<CreditEntry>> _creditEntryRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly DeleteCreditEntryHandler _handler;

    public DeleteCreditEntryHandlerTests()
    {
        _creditEntryRepositoryMock = new Mock<IRepository<CreditEntry>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new DeleteCreditEntryHandler(_creditEntryRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnSuccess_WhenCreditEntryExists()
    {
        // Arrange
        var creditEntry = CreateTestCreditEntry();
        var command = new DeleteCreditEntryCommand(creditEntry.Id);

        _creditEntryRepositoryMock
            .Setup(x => x.GetById(creditEntry.Id))
            .ReturnsAsync(creditEntry);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsSuccess.Should().BeTrue();
        creditEntry.IsActive.Should().BeFalse();
        _creditEntryRepositoryMock.Verify(x => x.Update(It.IsAny<CreditEntry>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenCreditEntryNotFound()
    {
        // Arrange
        var command = new DeleteCreditEntryCommand("nonexistent-id");

        _creditEntryRepositoryMock
            .Setup(x => x.GetById(It.IsAny<string>()))
            .ReturnsAsync((CreditEntry?)null);

        // Act & Assert
        await Assert.ThrowsAsync<CreditTracker.Application.Exception.CreditEntryNotFoundException>(
            async () => await _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ShouldMarkAsInactive_NotPhysicallyDelete()
    {
        // Arrange
        var creditEntry = CreateTestCreditEntry();
        var command = new DeleteCreditEntryCommand(creditEntry.Id);

        _creditEntryRepositoryMock
            .Setup(x => x.GetById(creditEntry.Id))
            .ReturnsAsync(creditEntry);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        creditEntry.IsActive.Should().BeFalse();
        _creditEntryRepositoryMock.Verify(x => x.Remove(It.IsAny<string>()), Times.Never);
    }

    private static CreditEntry CreateTestCreditEntry()
    {
        return CreditEntry.Create(
            "shop123",
            "Test Shop",
            "customer456",
            "Test Customer",
            "Test Item",
            100.50m,
            DateTime.UtcNow,
            false,
            null
        );
    }
}
