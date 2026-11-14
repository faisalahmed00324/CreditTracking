using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using CreditTracker.Domain.Enum;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CreditTracker.Api.Tests.Integration;

[Collection(MongoApiCollection.Name)]
[Trait("Category", "Integration")]
public sealed class ApiIntegrationTests(MongoApiFixture fixture) : IAsyncLifetime
{
    private const string MissingId = "000000000000000000000001";

    public Task InitializeAsync() => fixture.ResetAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Theory]
    [InlineData("GET", "/user/getcurrentuser")]
    [InlineData("GET", "/user/000000000000000000000001")]
    [InlineData("GET", "/user/search/customer")]
    [InlineData("GET", "/creditentry/000000000000000000000001")]
    [InlineData("GET", "/creditentry/getbyshopid?ShopId=x&PageIndex=1&PageSize=10")]
    [InlineData("GET", "/creditentry/getbycustomerid?CustomerId=x&PageIndex=1&PageSize=10")]
    [InlineData("POST", "/creditentry")]
    [InlineData("PUT", "/creditentry")]
    [InlineData("DELETE", "/creditentry/000000000000000000000001")]
    public async Task ProtectedEndpoints_RejectAnonymousRequests(string method, string path)
    {
        using var client = fixture.CreateClient();
        using var response = await SendAsync(client, method, path);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("GET", "/user/search/customer")]
    [InlineData("GET", "/user/000000000000000000000001")]
    [InlineData("GET", "/creditentry/getbyshopid?ShopId=x&PageIndex=1&PageSize=10")]
    [InlineData("POST", "/creditentry")]
    [InlineData("PUT", "/creditentry")]
    [InlineData("DELETE", "/creditentry/000000000000000000000001")]
    public async Task ShopEndpoints_RejectCustomerRole(string method, string path)
    {
        var customer = await fixture.SeedUserAsync(Role.Customer);
        using var client = fixture.CreateClient(customer);
        using var response = await SendAsync(client, method, path);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CustomerListing_RejectsShopRole()
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        using var client = fixture.CreateClient(shop);
        using var response = await client.GetAsync($"/creditentry/getbycustomerid?CustomerId={shop.Id}&PageIndex=1&PageSize=10");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("expired")]
    [InlineData("signature")]
    [InlineData("issuer")]
    [InlineData("audience")]
    [InlineData("malformed")]
    public async Task Authentication_RejectsInvalidTokens(string kind)
    {
        var customer = await fixture.SeedUserAsync(Role.Customer);
        using var client = fixture.CreateClient(customer,
            expires: kind == "expired" ? DateTime.UtcNow.AddHours(-1) : null,
            validSigningKey: kind != "signature",
            issuer: kind == "issuer" ? "wrong-issuer" : MongoApiFixture.Issuer,
            audience: kind == "audience" ? "wrong-audience" : MongoApiFixture.Audience);
        if (kind == "malformed")
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not-a-token");
        }
        using var response = await client.GetAsync("/user/getcurrentuser");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(Role.Shop)]
    [InlineData(Role.Customer)]
    public async Task CreditEntry_ReadRejectsUnrelatedUsers(Role role)
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        var customer = await fixture.SeedUserAsync(Role.Customer);
        var entry = await fixture.SeedEntryAsync(shop, customer);
        var stranger = await fixture.SeedUserAsync(role);
        using var client = fixture.CreateClient(stranger);
        using var response = await client.GetAsync($"/creditentry/{entry.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task CreditEntry_WriteRejectsAnotherShopWithoutChangingData(string method)
    {
        var owner = await fixture.SeedUserAsync(Role.Shop);
        var customer = await fixture.SeedUserAsync(Role.Customer);
        var entry = await fixture.SeedEntryAsync(owner, customer);
        var otherShop = await fixture.SeedUserAsync(Role.Shop);
        using var client = fixture.CreateClient(otherShop);
        using var response = method == "PUT"
            ? await client.PutAsJsonAsync("/creditentry", new { entry.Id, IsPaid = true, PaymentDate = DateTime.UtcNow })
            : await client.DeleteAsync($"/creditentry/{entry.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var stored = await fixture.Entries.Find(x => x.Id == entry.Id).SingleAsync();
        Assert.True(stored.IsActive);
        Assert.False(stored.IsPaid);
    }

    [Fact]
    public async Task CreditEntry_CreateRejectsSpoofedShopId()
    {
        var owner = await fixture.SeedUserAsync(Role.Shop);
        var otherShop = await fixture.SeedUserAsync(Role.Shop);
        var customer = await fixture.SeedUserAsync(Role.Customer);
        using var client = fixture.CreateClient(otherShop);
        using var response = await client.PostAsJsonAsync("/creditentry", new
        {
            ShopId = owner.Id, CustomerId = customer.Id, Item = "Item", Amount = 10m, Date = DateTime.UtcNow
        });
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(0, await fixture.Entries.CountDocumentsAsync(FilterDefinition<CreditTracker.Domain.Models.CreditEntry>.Empty));
    }

    [Theory]
    [InlineData(Role.Shop)]
    [InlineData(Role.Customer)]
    public async Task Listings_RejectAnotherUsersId(Role role)
    {
        var user = await fixture.SeedUserAsync(role);
        var other = await fixture.SeedUserAsync(role);
        using var client = fixture.CreateClient(user);
        var route = role == Role.Shop ? "getbyshopid?ShopId" : "getbycustomerid?CustomerId";
        using var response = await client.GetAsync($"/creditentry/{route}={other.Id}&PageIndex=1&PageSize=10");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Ownership_RejectsTokenWithoutUserId()
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        using var client = fixture.CreateClient(shop, includeIdentity: false);
        using var response = await client.GetAsync($"/creditentry/getbyshopid?ShopId={shop.Id}&PageIndex=1&PageSize=10");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData(Role.Shop, 1, 2)]
    [InlineData(Role.Shop, 2, 1)]
    [InlineData(Role.Customer, 1, 2)]
    [InlineData(Role.Customer, 2, 1)]
    public async Task Listings_ApplyOwnershipActiveFilterAndPagination(Role role, int page, int expectedCount)
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        var customer = await fixture.SeedUserAsync(Role.Customer);
        for (var i = 0; i < 3; i++)
        {
            await fixture.SeedEntryAsync(shop, customer);
        }
        await fixture.SeedEntryAsync(shop, customer, active: false);
        var otherShop = await fixture.SeedUserAsync(Role.Shop);
        var otherCustomer = await fixture.SeedUserAsync(Role.Customer);
        await fixture.SeedEntryAsync(otherShop, otherCustomer);
        var user = role == Role.Shop ? shop : customer;
        var route = role == Role.Shop ? "getbyshopid?ShopId" : "getbycustomerid?CustomerId";
        using var client = fixture.CreateClient(user);
        using var response = await client.GetAsync($"/creditentry/{route}={user.Id}&PageIndex={page}&PageSize=2");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var entries = body.GetProperty("creditEntries");
        Assert.Equal(3, entries.GetProperty("count").GetInt64());
        Assert.Equal(page, entries.GetProperty("pageIndex").GetInt32());
        var data = entries.GetProperty("data");
        Assert.Equal(expectedCount, data.GetArrayLength());
        foreach (var item in data.EnumerateArray())
        {
            Assert.Equal(shop.Id, item.GetProperty("shopId").GetString());
            Assert.Equal(customer.Id, item.GetProperty("customerId").GetString());
        }
    }

    [Fact]
    public async Task CreditEntry_FullLifecyclePersistsChangesAndSoftDeletes()
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        var customer = await fixture.SeedUserAsync(Role.Customer);
        using var shopClient = fixture.CreateClient(shop);
        using var customerClient = fixture.CreateClient(customer);
        using var created = await shopClient.PostAsJsonAsync("/creditentry", new
        {
            ShopId = shop.Id, CustomerId = customer.Id, Item = "Lifecycle", Amount = 123.45m, Date = DateTime.UtcNow
        });
        Assert.Equal(HttpStatusCode.OK, created.StatusCode);
        var id = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetString()!;
        Assert.True(ObjectId.TryParse(id, out _));
        foreach (var client in new[] { shopClient, customerClient })
        {
            using var read = await client.GetAsync($"/creditentry/{id}");
            Assert.Equal(HttpStatusCode.OK, read.StatusCode);
        }
        using var updated = await shopClient.PutAsJsonAsync("/creditentry", new { Id = id, IsPaid = true, PaymentDate = DateTime.UtcNow });
        Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
        var stored = await fixture.Entries.Find(x => x.Id == id).SingleAsync();
        Assert.True(stored.IsPaid);
        Assert.Equal(123.45m, stored.Amount);
        Assert.Equal(shop.Id, stored.CreatedBy);
        Assert.Equal(shop.Id, stored.ModifiedBy);
        using var deleted = await shopClient.DeleteAsync($"/creditentry/{id}");
        Assert.Equal(HttpStatusCode.OK, deleted.StatusCode);
        Assert.False((await fixture.Entries.Find(x => x.Id == id).SingleAsync()).IsActive);
        using var hidden = await customerClient.GetAsync($"/creditentry/{id}");
        Assert.Equal(HttpStatusCode.NotFound, hidden.StatusCode);
    }

    [Theory]
    [InlineData("GET", false)]
    [InlineData("PUT", false)]
    [InlineData("DELETE", false)]
    [InlineData("GET", true)]
    [InlineData("PUT", true)]
    [InlineData("DELETE", true)]
    public async Task MissingOrDeletedEntries_ReturnNotFound(string method, bool deleted)
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        var customer = await fixture.SeedUserAsync(Role.Customer);
        var id = deleted ? (await fixture.SeedEntryAsync(shop, customer, active: false)).Id : MissingId;
        using var client = fixture.CreateClient(shop);
        using var response = method == "PUT"
            ? await client.PutAsJsonAsync("/creditentry", new { Id = id, IsPaid = true, PaymentDate = DateTime.UtcNow })
            : await SendAsync(client, method, $"/creditentry/{id}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(404, problem.GetProperty("status").GetInt32());
        Assert.True(problem.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task Registration_Verification_Login_AndCurrentProfileWorkTogether()
    {
        using var client = fixture.CreateClient();
        using var registered = await client.PostAsJsonAsync("/user", new
        {
            User = new { UserName = "new-customer", Password = MongoApiFixture.Password, Name = "New customer",
                ICNoOrPassport = "TEST-ID", Role = Role.Customer, Email = "test@example.invalid", Address = "Test", Latitude = "1", Longitude = "2" }
        });
        Assert.Equal(HttpStatusCode.OK, registered.StatusCode);
        var id = (await registered.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetString()!;
        var user = await fixture.Users.Find(x => x.Id == id).SingleAsync();
        Assert.Matches("^[0-9]{6}$", user.OtpCode);
        Assert.False(user.IsVerified);
        Assert.NotEqual(MongoApiFixture.Password, user.PasswordHash);
        using var verified = await client.PostAsJsonAsync("/users/verifyotp", new { Id = id, Otp = user.OtpCode });
        Assert.Equal(HttpStatusCode.OK, verified.StatusCode);
        Assert.True((await verified.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("isSuccess").GetBoolean());
        using var reused = await client.PostAsJsonAsync("/users/verifyotp", new { Id = id, Otp = user.OtpCode });
        Assert.False((await reused.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("isSuccess").GetBoolean());
        using var login = await client.PostAsJsonAsync("/login", new { user.UserName, Password = MongoApiFixture.Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var token = (await login.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("token").GetString();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        using var profile = await client.GetAsync("/user/getcurrentuser");
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        var body = await profile.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(id, body.GetProperty("user").GetProperty("id").GetString());
        AssertNoCredentials(body.GetProperty("user"));
    }

    [Theory]
    [InlineData("login")]
    [InlineData("register")]
    [InlineData("otp")]
    [InlineData("credit")]
    public async Task InvalidRequests_ReachValidationPipelineAndReturnProblems(string kind)
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        using var client = fixture.CreateClient(shop);
        using var response = kind switch
        {
            "login" => await client.PostAsJsonAsync("/login", new { UserName = "", Password = "" }),
            "register" => await client.PostAsJsonAsync("/user", new { User = new { UserName = "", Password = "", Name = "", ICNoOrPassport = "", Role = Role.Shop } }),
            "otp" => await client.PostAsJsonAsync("/users/verifyotp", new { Id = "", Otp = "" }),
            _ => await client.PostAsJsonAsync("/creditentry", new { ShopId = shop.Id, CustomerId = MissingId, Item = "", Amount = 0m, Date = DateTime.UtcNow })
        };
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(400, problem.GetProperty("status").GetInt32());
        Assert.NotEmpty(problem.GetProperty("ValidationErrors").EnumerateArray());
    }

    [Theory]
    [InlineData(false, MongoApiFixture.Password, HttpStatusCode.NotFound)]
    [InlineData(true, "wrong-password", HttpStatusCode.BadRequest)]
    public async Task Login_RejectsUnverifiedUsersAndWrongPasswords(bool verified, string password, HttpStatusCode expected)
    {
        var user = await fixture.SeedUserAsync(Role.Customer, verified);
        using var client = fixture.CreateClient();
        using var response = await client.PostAsJsonAsync("/login", new { user.UserName, Password = password });
        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task UserReadAndSearch_DoNotExposeCredentials()
    {
        var shop = await fixture.SeedUserAsync(Role.Shop);
        var customer = await fixture.SeedUserAsync(Role.Customer, name: "UniqueCustomer");
        using var client = fixture.CreateClient(shop);
        using var read = await client.GetAsync($"/user/{customer.Id}");
        Assert.Equal(HttpStatusCode.OK, read.StatusCode);
        AssertNoCredentials((await read.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("user"));
        using var search = await client.GetAsync("/user/search/UniqueCustomer");
        Assert.Equal(HttpStatusCode.OK, search.StatusCode);
        var users = (await search.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("users");
        Assert.Single(users.EnumerateArray());
        AssertNoCredentials(users[0]);
    }

    [Fact]
    public async Task SwaggerAndHealthChecksWorkWithRealStartup()
    {
        using var client = fixture.CreateClient();
        using var swagger = await client.GetAsync("/swagger/v1/swagger.json");
        Assert.Equal(HttpStatusCode.OK, swagger.StatusCode);
        var document = await swagger.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(document.GetProperty("paths").TryGetProperty("/creditentry", out _));
        Assert.True(document.GetProperty("paths").TryGetProperty("/users/verifyotp", out _));
        using var health = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
        Assert.Equal("Healthy", (await health.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("status").GetString());
    }

    private static void AssertNoCredentials(JsonElement user)
    {
        foreach (var field in new[] { "password", "passwordHash", "otpCode", "otpExpiry" })
        {
            Assert.False(user.TryGetProperty(field, out _), $"Response exposed {field}");
        }
    }

    private static async Task<HttpResponseMessage> SendAsync(HttpClient client, string method, string path)
    {
        using var request = new HttpRequestMessage(new HttpMethod(method), path);
        if (method is "POST" or "PUT")
        {
            request.Content = new StringContent("{}", Encoding.UTF8, "application/json");
        }
        return await client.SendAsync(request);
    }
}
