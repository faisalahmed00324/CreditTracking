using CreditTracker.Domain.Models;
using MongoDB.Bson.Serialization;

namespace CreditTracker.Infrastructure.Map
{
    public class UserMapper
    {
        public static void Map()
        {
            if (!BsonClassMap.IsClassMapRegistered(typeof(User)))
            {
                BsonClassMap.RegisterClassMap<User>(x =>
                {
                    x.AutoMap();
                });
            }
        }
    }
}
