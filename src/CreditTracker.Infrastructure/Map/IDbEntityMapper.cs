using CreditTracker.Domain.Abstractions;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;

namespace CreditTracker.Infrastructure.Map
{
    public class IDbEntityMapper
    {
        public static void  Map()
        {
            if (!BsonClassMap.IsClassMapRegistered(typeof(Entity<string>)))
            {
                BsonClassMap.RegisterClassMap<Entity<string>>(x =>
                {
                    x.AutoMap();
                    x.MapIdMember(c => c.Id)
                        .SetIdGenerator(StringObjectIdGenerator.Instance)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                    x.MapProperty(e => e.CreatedBy)
                        .SetElementName("CreatedBy")
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                    x.MapProperty(e => e.ModifiedBy)
                        .SetElementName("ModifiedBy")
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                    x.MapProperty(e => e.CreatedAt).SetElementName("CreatedAt");
                    x.MapProperty(e => e.ModifiedAt).SetElementName("ModifiedAt");
                    x.MapProperty(e => e.IsActive).SetElementName("IsActive");
                });
            }
        }
    }
}
