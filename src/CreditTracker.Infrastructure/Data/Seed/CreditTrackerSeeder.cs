using BuildingBlocks.Helper;
using CreditTracker.Domain.Enum;
using CreditTracker.Domain.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CreditTracker.Infrastructure.Data.Seed
{
    public static class CreditTrackerSeeder
    {
        public static async Task SeedAsync(IConfiguration config)
        {
            var connectionString = config.GetSection("Database:Connection").Value!;
            var databaseName = config.GetSection("Database:Name").Value!;

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);

            var users = database.GetCollection<User>(nameof(User));
            var creditEntries = database.GetCollection<CreditEntry>(nameof(CreditEntry));

            await EnsureUserTextIndex(users);

            var now = DateTime.UtcNow;

            var shop = await UpsertUserAsync(users, new UserSeedModel
            {
                UserName = "shopdemo01",
                Email = "shopdemo01@example.com",
                Password = "Shop@12345",
                Role = Role.Shop,
                Name = "Demo Shop",
                ICNoOrPassport = "SHOP-IC-001",
                Address = "Banani, Dhaka",
                Latitude = "23.7937",
                Longitude = "90.4066"
            }, now);

            var customer1 = await UpsertUserAsync(users, new UserSeedModel
            {
                UserName = "customerdemo01",
                Email = "customerdemo01@example.com",
                Password = "Customer@123",
                Role = Role.Customer,
                Name = "Rahim Uddin",
                ICNoOrPassport = "CUST-IC-001",
                Address = "Kafrul, Dhaka",
                Latitude = "23.8113",
                Longitude = "90.4050"
            }, now);

            var customer2 = await UpsertUserAsync(users, new UserSeedModel
            {
                UserName = "customerdemo02",
                Email = "customerdemo02@example.com",
                Password = "Customer@123",
                Role = Role.Customer,
                Name = "Karim Ahmed",
                ICNoOrPassport = "CUST-IC-002",
                Address = "Mirpur, Dhaka",
                Latitude = "23.8223",
                Longitude = "90.3654"
            }, now);

            await UpsertCreditEntryAsync(creditEntries, shop, customer1, "Grocery Pack", 180.50m, now.AddDays(-7), false, null, now);
            await UpsertCreditEntryAsync(creditEntries, shop, customer1, "Cooking Oil", 95.00m, now.AddDays(-3), true, now.AddDays(-1), now);
            await UpsertCreditEntryAsync(creditEntries, shop, customer2, "Rice Bag", 210.00m, now.AddDays(-5), false, null, now);
            await UpsertCreditEntryAsync(creditEntries, shop, customer2, "Baby Food", 67.25m, now.AddDays(-2), false, null, now);
        }

        private static async Task EnsureUserTextIndex(IMongoCollection<User> users)
        {
            var textKeys = Builders<User>.IndexKeys
                .Text(x => x.Name)
                .Text(x => x.UserName)
                .Text(x => x.ICNoOrPassport)
                .Text(x => x.Email);

            var model = new CreateIndexModel<User>(textKeys, new CreateIndexOptions
            {
                Name = "user_text_search_idx"
            });

            await users.Indexes.CreateOneAsync(model);
        }

        private static async Task<SeedUserRef> UpsertUserAsync(IMongoCollection<User> users, UserSeedModel seed, DateTime now)
        {
            var passwordHash = PasswordHasher.Hash(seed.Password);

            var update = Builders<User>.Update
                .Set(x => x.Email, seed.Email)
                .Set(x => x.PasswordHash, passwordHash)
                .Set(x => x.Role, seed.Role)
                .Set(x => x.Name, seed.Name)
                .Set(x => x.ICNoOrPassport, seed.ICNoOrPassport)
                .Set(x => x.Address, seed.Address)
                .Set(x => x.Latitude, seed.Latitude)
                .Set(x => x.Longitude, seed.Longitude)
                .Set(x => x.IsVerified, true)
                .Set(x => x.IsActive, true)
                .Set(x => x.OtpCode, null)
                .Set(x => x.OtpExpiry, now)
                .Set(x => x.ModifiedAt, now)
                .Set(x => x.ModifiedBy, ObjectId.Empty.ToString())
                .SetOnInsert(x => x.UserName, seed.UserName)
                .SetOnInsert(x => x.CreatedAt, now)
                .SetOnInsert(x => x.CreatedBy, ObjectId.Empty.ToString());

            await users.UpdateOneAsync(
                x => x.UserName == seed.UserName,
                update,
                new UpdateOptions { IsUpsert = true });

            var userDoc = await users.Database
                .GetCollection<BsonDocument>(nameof(User))
                .Find(new BsonDocument("UserName", seed.UserName))
                .Project(new BsonDocument
                {
                    { "_id", 1 },
                    { "Name", 1 }
                })
                .FirstOrDefaultAsync();

            var userId = userDoc?["_id"]?.ToString() ?? string.Empty;
            var userName = userDoc?.GetValue("Name", seed.Name).AsString ?? seed.Name;
            return new SeedUserRef(userId, userName);
        }

        private static async Task UpsertCreditEntryAsync(
            IMongoCollection<CreditEntry> creditEntries,
            SeedUserRef shop,
            SeedUserRef customer,
            string item,
            decimal amount,
            DateTime date,
            bool isPaid,
            DateTime? paymentDate,
            DateTime now)
        {
            var update = Builders<CreditEntry>.Update
                .Set(x => x.ShopId, shop.Id)
                .Set(x => x.ShopName, shop.Name)
                .Set(x => x.CustomerId, customer.Id)
                .Set(x => x.CustomerName, customer.Name)
                .Set(x => x.Item, item)
                .Set(x => x.Amount, amount)
                .Set(x => x.Date, date)
                .Set(x => x.IsPaid, isPaid)
                .Set(x => x.PaymentDate, paymentDate)
                .Set(x => x.IsActive, true)
                .Set(x => x.ModifiedAt, now)
                .Set(x => x.ModifiedBy, ObjectId.Empty.ToString())
                .SetOnInsert(x => x.CreatedAt, now)
                .SetOnInsert(x => x.CreatedBy, ObjectId.Empty.ToString());

            await creditEntries.UpdateOneAsync(
                x => x.ShopId == shop.Id && x.CustomerId == customer.Id && x.Item == item,
                update,
                new UpdateOptions { IsUpsert = true });
        }

        private sealed class UserSeedModel
        {
            public string UserName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public Role Role { get; set; }
            public string Name { get; set; } = string.Empty;
            public string ICNoOrPassport { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
            public string Latitude { get; set; } = string.Empty;
            public string Longitude { get; set; } = string.Empty;
        }

        private sealed record SeedUserRef(string Id, string Name);
    }
}
