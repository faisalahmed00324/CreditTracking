using CreditTracker.Application.Customers.Queries.SearchCustomer;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using CreditTracker.Domain.Enum;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;

namespace CreditTracker.Application.Tests;

public class SearchCustomerHandlerTests
{
    private readonly Mock<IRepository<User>> _userRepoMock;
    private readonly SearchCustomerHandler _handler;

    public SearchCustomerHandlerTests()
    {
        _userRepoMock = new Mock<IRepository<User>>();
        _handler = new SearchCustomerHandler(_userRepoMock.Object);
    }

    [Fact]
    public async Task Handle_MatchingCustomers_ReturnsResults()
    {
        // Arrange
        var customers = new List<User>
        {
            User.Create("customer1", "c1@email.com", "hash", Role.Customer, "John", "IC001", "Addr1", "1", "2"),
            User.Create("customer2", "c2@email.com", "hash", Role.Customer, "Jane", "IC002", "Addr2", "3", "4")
        };
        _userRepoMock.Setup(r => r.TextSearchAsync("John", It.IsAny<Expression<Func<User, bool>>?>())).ReturnsAsync(customers);

        var query = new SearchCustomerQuery("John");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Users.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_NoMatchingCustomers_ReturnsEmptyList()
    {
        // Arrange
        _userRepoMock.Setup(r => r.TextSearchAsync("xyz", It.IsAny<Expression<Func<User, bool>>?>())).ReturnsAsync(new List<User>());
        var query = new SearchCustomerQuery("xyz");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Users.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_NullResult_ReturnsEmptyList()
    {
        // Arrange
        _userRepoMock.Setup(r => r.TextSearchAsync("abc", It.IsAny<Expression<Func<User, bool>>?>())).ReturnsAsync((List<User>?)null);
        var query = new SearchCustomerQuery("abc");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Users.Should().BeEmpty();
    }
}
