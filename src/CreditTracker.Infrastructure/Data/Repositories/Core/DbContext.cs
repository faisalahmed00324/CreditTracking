using CreditTracker.Infrastructure.Map;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditTracker.Infrastructure.Data.Repositories.Core
{
    public class DbContext : IDbContext
    {
        private IMongoDatabase Database { get; set; }
        private List<Func<Task>> _commands;
        private static readonly object _lock = new();

        public DbContext(string connectionString, string dbName)
        {
            _commands = [];

            RegisterConventions();
            var mongoClient = new MongoClient(connectionString);

            Database = mongoClient.GetDatabase(dbName);
            DefineClassMaps();
        }

        private static void DefineClassMaps()
        {
            IDbEntityMapper.Map();
            UserMapper.Map();
            CreditEntryMapper.Map();
        }
        private static void RegisterConventions()
        {
            var pack = new ConventionPack
            {
                new IgnoreExtraElementsConvention(true)
            };
            ConventionRegistry.Register("My conventions", pack, t => true);
        }
        public void AddCommand(Func<Task> func)
        {
            _commands.Add(func);
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }

        public IMongoCollection<T> GetCollection<T>(string name)
        {
            return Database.GetCollection<T>(name);
        }

        public void Reset()
        {
            this._commands = [];

            this.Dispose();
        }

        public async Task<int> SaveChanges()
        {
            var commandTasks = _commands.Select(c => c());

            await Task.WhenAll(commandTasks);

            return _commands.Count;
        }
    }
}
