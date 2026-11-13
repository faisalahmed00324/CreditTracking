using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using CreditTracker.Infrastructure.Data.Repositories;
using CreditTracker.Infrastructure.Data.Repositories.Core;
using CreditTracker.Infrastructure.Map;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Driver;


namespace CreditTracker.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
        {
            var connectionString = config.GetSection("Database:Connection").Value!;            
            var databaseName = config.GetSection("Database:Name").Value!;

            // Ensure class maps are registered before any typed collection access.
            IDbEntityMapper.Map();
            UserMapper.Map();
            CreditEntryMapper.Map();

            EnsureMongoIndexes(connectionString, databaseName);

            services.AddSingleton<IDbContext>(x => new DbContext(connectionString, databaseName));
            services.AddTransient(typeof(IRepository<User>), typeof(UserRepository<User>));
            services.AddTransient(typeof(IRepository<CreditEntry>), typeof(CreditEntryRepository<CreditEntry>));
            services.AddTransient<IUnitOfWork, UnitOfWork>();

            return services;
        }

        private static void EnsureMongoIndexes(string connectionString, string databaseName)
        {
            var mongoClient = new MongoClient(connectionString);
            var database = mongoClient.GetDatabase(databaseName);
            // Use BsonDocument collection to avoid forcing early typed class-map
            // auto-registration before our explicit map setup.
            var users = database.GetCollection<BsonDocument>(nameof(User));

            var textKeys = Builders<BsonDocument>.IndexKeys
                .Text("Name")
                .Text("UserName")
                .Text("ICNoOrPassport")
                .Text("Email");

            var model = new CreateIndexModel<BsonDocument>(textKeys, new CreateIndexOptions
            {
                Name = "user_text_search_idx"
            });

            users.Indexes.CreateOne(model);
        }
    }
}
