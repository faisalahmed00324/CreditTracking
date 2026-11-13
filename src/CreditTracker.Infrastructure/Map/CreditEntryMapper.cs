using CreditTracker.Domain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace CreditTracker.Infrastructure.Map
{
    public class CreditEntryMapper
    {
        public static void Map()
        {
            if (!BsonClassMap.IsClassMapRegistered(typeof(CreditEntry)))
            {
                BsonClassMap.RegisterClassMap<CreditEntry>(x =>
                {
                    x.AutoMap();
                    x.MapProperty(e => e.ShopId).SetElementName("ShopId")
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                    x.MapProperty(e => e.CustomerId).SetElementName("CustomerId")
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                });
            }
        }
    }
}
