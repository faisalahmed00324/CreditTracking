using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BuildingBlocks.Helper;
using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using Testcontainers.MongoDb;

namespace CreditTracker.Api.Tests.Integration;

[CollectionDefinition("MongoDB integration", DisableParallelization = true)]
public sealed class MongoApiCollection : ICollectionFixture<MongoApiFixture>
{
    public const string Name = "MongoDB integration";
}

public sealed class MongoApiFixture : IAsyncLifetime
{
    public const string Password = "Test-password-123!";
    public const string Issuer = "credittracker-tests";
    public const string Audience = "credittracker-test-client";

    private readonly MongoDbContainer _mongo = new MongoDbBuilder("mongo:8.0")
        .WithUsername("credittracker-tests")
        .WithPassword(Convert.ToHexString(RandomNumberGenerator.GetBytes(32)))
        .Build();
    private readonly string _secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    private WebApplication _app = null!;

    // Never use application settings or a shared/developer database in this fixture.
    public string DatabaseName { get; } = $"credittracker_tests_{Guid.NewGuid():N}";
    public string ConnectionString => _mongo.GetConnectionString();
    public IMongoDatabase Database { get; private set; } = null!;
    public IServiceProvider Services => _app.Services;
    public IMongoCollection<User> Users => Database.GetCollection<User>(nameof(User));
    public IMongoCollection<CreditEntry> Entries => Database.GetCollection<CreditEntry>(nameof(CreditEntry));

    public async Task InitializeAsync()
    {
        await _mongo.StartAsync();
        Database = new MongoClient(ConnectionString).GetDatabase(DatabaseName);

        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            EnvironmentName = "Testing",
            ApplicationName = typeof(ApiHost).Assembly.GetName().Name
        });
        builder.WebHost.UseTestServer();
        builder.Logging.ClearProviders();
        builder.Configuration.Sources.Clear();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Database:Connection"] = ConnectionString,
            ["Database:Name"] = DatabaseName,
            ["JwtSettings:Secret"] = _secret,
            ["JwtSettings:Issuer"] = Issuer,
            ["JwtSettings:Audience"] = Audience
        });

        _app = ApiHost.Build(builder);
        await _app.StartAsync();
    }

    public async Task ResetAsync()
    {
        // Preserve the real startup-created indexes, but isolate each test's data.
        await Users.DeleteManyAsync(Builders<User>.Filter.Empty);
        await Entries.DeleteManyAsync(Builders<CreditEntry>.Filter.Empty);
    }

    public HttpClient CreateClient(User? user = null, DateTime? expires = null,
        bool validSigningKey = true, string issuer = Issuer, string audience = Audience,
        bool includeIdentity = true)
    {
        var client = _app.GetTestClient();
        if (user is null)
        {
            return client;
        }

        var claims = new List<Claim> { new(ClaimTypes.Role, user.Role.ToString()) };
        if (includeIdentity)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id));
        }
        var key = new SymmetricSecurityKey(validSigningKey
            ? Encoding.UTF8.GetBytes(_secret)
            : RandomNumberGenerator.GetBytes(64));
        var token = new JwtSecurityToken(issuer, audience, claims,
            expires: expires ?? DateTime.UtcNow.AddHours(1),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer", new JwtSecurityTokenHandler().WriteToken(token));
        return client;
    }

    public async Task<User> SeedUserAsync(Role role, bool verified = true, string? name = null)
    {
        var user = User.Create($"user-{Guid.NewGuid():N}", "test@example.invalid",
            PasswordHasher.Hash(Password), role, name ?? role.ToString(), "TEST-ID", "Test address", "1", "2");
        if (verified)
        {
            user.SetOtp("123456", DateTime.UtcNow.AddMinutes(5));
            Assert.True(user.VerifyOtp("123456"));
        }
        await Users.InsertOneAsync(user);
        return user;
    }

    public async Task<CreditEntry> SeedEntryAsync(User shop, User customer, bool active = true)
    {
        var entry = CreditEntry.Create(shop.Id, shop.Name, customer.Id, customer.Name,
            "Test item", 12.34m, DateTime.UtcNow, false, null);
        if (!active)
        {
            entry.Remove();
        }
        await Entries.InsertOneAsync(entry);
        return entry;
    }

    public async Task DisposeAsync()
    {
        try
        {
            if (_app is not null)
            {
                await _app.DisposeAsync();
            }
        }
        finally
        {
            await _mongo.DisposeAsync();
        }
    }
}
