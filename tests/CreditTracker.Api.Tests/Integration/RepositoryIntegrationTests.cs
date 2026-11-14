using CreditTracker.Application.Commons;
using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Models;
using CreditTracker.Infrastructure.Data.Repositories;
using CreditTracker.Infrastructure.Data.Repositories.Core;
using CreditTracker.Infrastructure.Data.Seed;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CreditTracker.Api.Tests.Integration;

[Collection(MongoApiCollection.Name)]
[Trait("Category", "Integration")]
public sealed class RepositoryIntegrationTests(MongoApiFixture fixture) : IAsyncLifetime
{
    public Task InitializeAsync() => fixture.ResetAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Add_IsDeferredUntilCommit_AndCommitResetsPendingCommands()
    {
        using var context = NewContext();
        var actor = new TestCurrentUser(ObjectId.GenerateNewId().ToString());
        using var repository = new UserRepository<User>(context, actor);
        using var unitOfWork = new UnitOfWork(context);
        var user = NewUser("Deferred");
        repository.Add(user);
        Assert.Equal(0, await fixture.Users.CountDocumentsAsync(Builders<User>.Filter.Empty));
        Assert.Equal(1, await unitOfWork.SaveChangesAsync());
        Assert.True(ObjectId.TryParse(user.Id, out _));
        var stored = await repository.GetById(user.Id);
        Assert.Equal("Deferred", stored.Name);
        Assert.Equal(actor.UserId, stored.CreatedBy);
        Assert.Equal(actor.UserId, stored.ModifiedBy);
        Assert.Equal(DateTimeKind.Utc, stored.CreatedAt!.Value.Kind);
        Assert.Equal(0, await unitOfWork.SaveChangesAsync());
        Assert.Equal(1, await repository.CountAsync(x => true));
    }

    [Fact]
    public async Task Update_PreservesCreationAuditAndPersistsPrivateProperties()
    {
        using var context = NewContext();
        var creator = new TestCurrentUser(ObjectId.GenerateNewId().ToString());
        var editor = new TestCurrentUser(ObjectId.GenerateNewId().ToString());
        using var createRepository = new UserRepository<User>(context, creator);
        using var editRepository = new UserRepository<User>(context, editor);
        using var unitOfWork = new UnitOfWork(context);
        var user = NewUser("Before");
        createRepository.Add(user);
        await unitOfWork.SaveChangesAsync();
        var createdAt = (await createRepository.GetById(user.Id)).CreatedAt;
        var loaded = await editRepository.GetById(user.Id);
        loaded.Update("new-hash", "After", "New address", "3", "4");
        editRepository.Update(loaded);
        await unitOfWork.SaveChangesAsync();
        var stored = await editRepository.GetById(user.Id);
        Assert.Equal("After", stored.Name);
        Assert.Equal("new-hash", stored.PasswordHash);
        Assert.Equal(creator.UserId, stored.CreatedBy);
        Assert.Equal(editor.UserId, stored.ModifiedBy);
        Assert.Equal(createdAt, stored.CreatedAt);
    }

    [Fact]
    public async Task CreditEntry_MappingRoundTripsObjectIdsMoneyAndUtcDates()
    {
        using var context = NewContext();
        using var repository = new CreditEntryRepository<CreditEntry>(context, new TestCurrentUser(null));
        using var unitOfWork = new UnitOfWork(context);
        var shopId = ObjectId.GenerateNewId().ToString();
        var customerId = ObjectId.GenerateNewId().ToString();
        var date = new DateTime(2026, 1, 2, 12, 30, 45, 123, DateTimeKind.Utc);
        var entry = CreditEntry.Create(shopId, "Shop", customerId, "Customer", "Mapped", 123.45m, date, false, null);
        repository.Add(entry);
        await unitOfWork.SaveChangesAsync();
        var raw = await fixture.Database.GetCollection<BsonDocument>(nameof(CreditEntry))
            .Find(new BsonDocument("_id", ObjectId.Parse(entry.Id))).SingleAsync();
        Assert.Equal(BsonType.ObjectId, raw["_id"].BsonType);
        Assert.Equal(BsonType.ObjectId, raw["ShopId"].BsonType);
        Assert.Equal(BsonType.ObjectId, raw["CustomerId"].BsonType);
        var loaded = await repository.GetById(entry.Id);
        Assert.Equal(shopId, loaded.ShopId);
        Assert.Equal(customerId, loaded.CustomerId);
        Assert.Equal(123.45m, loaded.Amount);
        Assert.Equal(date, loaded.Date);
        Assert.Null(loaded.PaymentDate);
        Assert.Equal(ObjectId.Empty.ToString(), loaded.CreatedBy);
    }

    [Fact]
    public async Task ReadOperations_ApplyRealMongoPredicatesAndPagination()
    {
        using var context = NewContext();
        using var repository = new UserRepository<User>(context, new TestCurrentUser(null));
        using var unitOfWork = new UnitOfWork(context);
        var users = Enumerable.Range(0, 4).Select(i => NewUser($"Person {i}")).ToArray();
        users[3].Remove();
        repository.AddMany(users);
        await unitOfWork.SaveChangesAsync();
        Assert.True(await repository.Any(x => x.Name == "Person 0"));
        Assert.False(await repository.Any(x => x.Name == "Missing"));
        Assert.Equal(3, await repository.CountAsync(x => x.IsActive));
        Assert.Equal(3, (await repository.GetByFilter(x => x.IsActive)).Count);
        Assert.Equal(3, (await repository.GetAllAsync(x => x.IsActive)).Count);
        Assert.Equal(3, (await repository.GetAll()).Count(x => x.IsActive));
        Assert.Equal(2, repository.GetAllByIds([users[0].Id, users[1].Id]).Count());
        Assert.Equal(users[0].Id, (await repository.GetSingle(x => x.Name == "Person 0")).Id);
        Assert.Null(await repository.GetById(ObjectId.GenerateNewId().ToString()));
        var firstPage = await repository.GetByFilterWithPagination(x => x.IsActive, 2, 0);
        var secondPage = await repository.GetByFilterWithPagination(x => x.IsActive, 2, 2);
        Assert.Equal(2, firstPage.Count);
        Assert.Single(secondPage);
        Assert.Empty(firstPage.Select(x => x.Id).Intersect(secondPage.Select(x => x.Id)));
    }

    [Fact]
    public async Task BulkReplacementAndUpdate_PersistValuesAndAuditFields()
    {
        using var context = NewContext();
        var actor = new TestCurrentUser(ObjectId.GenerateNewId().ToString());
        using var repository = new UserRepository<User>(context, actor);
        using var unitOfWork = new UnitOfWork(context);
        var users = new[] { NewUser("First"), NewUser("Second") };
        repository.AddMany(users);
        await unitOfWork.SaveChangesAsync();
        foreach (var user in users)
        {
            user.Update(user.PasswordHash, "Replaced", "Address", "1", "2");
        }
        repository.ReplaceMany(users);
        await unitOfWork.SaveChangesAsync();
        Assert.Equal(2, await repository.CountAsync(x => x.Name == "Replaced"));
        repository.UpdateMany(x => x.Role == Role.Customer, x => x.Name, "Updated");
        await unitOfWork.SaveChangesAsync();
        var loaded = await repository.GetByFilter(x => x.Name == "Updated");
        Assert.Equal(2, loaded.Count);
        Assert.All(loaded, user => Assert.Equal(actor.UserId, user.ModifiedBy));
    }

    [Fact]
    public async Task RemoveOverloads_DeleteOnlyMatchingDocuments()
    {
        using var context = NewContext();
        using var repository = new UserRepository<User>(context, new TestCurrentUser(null));
        using var unitOfWork = new UnitOfWork(context);
        var users = Enumerable.Range(0, 4).Select(i => NewUser($"Remove {i}")).ToArray();
        repository.AddMany(users);
        await unitOfWork.SaveChangesAsync();
        repository.Remove(users[0].Id);
        repository.Remove(x => x.Id == users[1].Id);
        repository.RemoveMany(x => x.Id == users[2].Id);
        await unitOfWork.SaveChangesAsync();
        Assert.Equal(users[3].Id, (await repository.GetByFilter(x => true)).Single().Id);
    }

    [Fact]
    public async Task Reset_DiscardsUncommittedCommands()
    {
        using var context = NewContext();
        using var repository = new UserRepository<User>(context, new TestCurrentUser(null));
        using var unitOfWork = new UnitOfWork(context);
        repository.Add(NewUser("Discarded"));
        repository.Reset();
        Assert.Equal(0, await unitOfWork.SaveChangesAsync());
        Assert.Equal(0, await repository.CountAsync(x => true));
    }

    [Fact]
    public async Task Commit_PropagatesDatabaseWriteFailures()
    {
        using var context = NewContext();
        using var repository = new UserRepository<User>(context, new TestCurrentUser(null));
        using var unitOfWork = new UnitOfWork(context);
        var user = NewUser("Original");
        repository.Add(user);
        await unitOfWork.SaveChangesAsync();
        repository.Add(user); // A duplicate _id must not be reported as a successful commit.
        await Assert.ThrowsAsync<MongoWriteException>(() => unitOfWork.SaveChangesAsync());
        context.Reset();
        Assert.Equal(1, await repository.CountAsync(x => true));
    }

    [Fact]
    public async Task Startup_CreatesExpectedTextIndex_AndIndexedSearchWorks()
    {
        var indexes = await fixture.Users.Indexes.ListAsync();
        var index = (await indexes.ToListAsync()).Single(x => x["name"] == "user_text_search_idx");
        Assert.Equal(new[] { "Email", "ICNoOrPassport", "Name", "UserName" },
            index["weights"].AsBsonDocument.Names.OrderBy(x => x).ToArray());
        await fixture.SeedUserAsync(Role.Customer, name: "UniqueSearchCustomer");
        await fixture.SeedUserAsync(Role.Shop, name: "UniqueSearchCustomer");
        using var context = NewContext();
        using var repository = new UserRepository<User>(context, new TestCurrentUser(null));
        var results = await repository.TextSearchAsync("UniqueSearchCustomer", x => x.Role == Role.Customer);
        Assert.Single(results);
        Assert.Equal(Role.Customer, results[0].Role);
    }

    [Fact]
    public async Task SearchWithoutTextIndex_FallsBackToEscapedRegexAndPreservesFilter()
    {
        // A second database belongs only to this test, so the shared startup index stays intact.
        var name = $"credittracker_tests_fallback_{Guid.NewGuid():N}";
        var client = new MongoClient(fixture.ConnectionString);
        try
        {
            using var context = new DbContext(fixture.ConnectionString, name);
            using var repository = new UserRepository<User>(context, new TestCurrentUser(null));
            using var unitOfWork = new UnitOfWork(context);
            repository.AddMany([NewUser("a+b customer"), NewUser("ab nonmatch"), NewUser("a+b shop", Role.Shop)]);
            await unitOfWork.SaveChangesAsync();
            var results = await repository.TextSearchAsync("a+b", x => x.Role == Role.Customer);
            Assert.Single(results);
            Assert.Equal("a+b customer", results[0].Name);
            Assert.Equal(3, (await repository.TextSearchAsync("", x => true)).Count);
        }
        finally
        {
            await client.DropDatabaseAsync(name);
        }
    }

    [Fact]
    public async Task Seeder_RerunsWithoutDuplicatingUsersOrCreditEntries()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Database:Connection"] = fixture.ConnectionString,
            ["Database:Name"] = fixture.DatabaseName
        }).Build();
        await CreditTrackerSeeder.SeedAsync(configuration);
        var originalUsers = await fixture.Users.Find(x => true).ToListAsync();
        var originalEntries = await fixture.Entries.Find(x => true).ToListAsync();
        Assert.Equal(3, originalUsers.Count);
        Assert.Equal(4, originalEntries.Count);

        await CreditTrackerSeeder.SeedAsync(configuration);
        var users = await fixture.Users.Find(x => true).ToListAsync();
        var entries = await fixture.Entries.Find(x => true).ToListAsync();
        Assert.Equal(originalUsers.Select(x => x.Id).OrderBy(x => x), users.Select(x => x.Id).OrderBy(x => x));
        Assert.Equal(originalEntries.Select(x => x.Id).OrderBy(x => x), entries.Select(x => x.Id).OrderBy(x => x));
        Assert.Single(users, x => x.Role == Role.Shop);
        Assert.Single(entries, x => x.IsPaid);
        Assert.All(users, user =>
        {
            Assert.True(user.IsVerified);
            Assert.True(user.IsActive);
            Assert.Null(user.OtpCode);
            Assert.NotEmpty(user.PasswordHash);
        });
        Assert.All(entries, entry =>
        {
            Assert.Contains(users, user => user.Id == entry.ShopId && user.Role == Role.Shop);
            Assert.Contains(users, user => user.Id == entry.CustomerId && user.Role == Role.Customer);
        });
    }

    private DbContext NewContext() => new(fixture.ConnectionString, fixture.DatabaseName);

    private static User NewUser(string name, Role role = Role.Customer) =>
        User.Create($"user-{Guid.NewGuid():N}", "test@example.invalid", "test-hash", role, name, "TEST", "Address", "1", "2");

    private sealed record TestCurrentUser(string? UserId) : ICurrentUserService;
}
