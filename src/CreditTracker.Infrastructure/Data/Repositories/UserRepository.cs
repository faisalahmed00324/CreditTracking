using CreditTracker.Application.Commons;
using CreditTracker.Application.Data;
using CreditTracker.Domain.Models;
using CreditTracker.Infrastructure.Data.Repositories.Core;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Linq.Expressions;

namespace CreditTracker.Infrastructure.Data.Repositories
{
    public class UserRepository<T> : Repository<T>, IRepository<T> where T : User
    {
        public UserRepository(IDbContext context, ICurrentUserService currentUserService) : base(context, currentUserService)
        {
        }

        public override async Task<List<T>> TextSearchAsync(string searchText, Expression<Func<T, bool>>? additionalFilter = null)
        {
            var textFilter = Builders<T>.Filter.Text(searchText);
            FilterDefinition<T> finalFilter = textFilter;
            if (additionalFilter != null)
            {
                var additionalMongoFilter = Builders<T>.Filter.Where(additionalFilter);
                finalFilter = Builders<T>.Filter.And(textFilter, additionalMongoFilter);
            }

            try
            {
                var result = await DbSet.Find(finalFilter).ToListAsync();
                if (result.Count > 0)
                {
                    return result;
                }
            }
            catch (MongoCommandException ex) when (ex.Message.Contains("text index required", StringComparison.OrdinalIgnoreCase))
            {
            }

            var fallbackFilter = BuildFallbackTextFilter(searchText);
            FilterDefinition<T> combinedFallback = fallbackFilter;
            if (additionalFilter != null)
            {
                var additionalMongoFilter = Builders<T>.Filter.Where(additionalFilter);
                combinedFallback = Builders<T>.Filter.And(fallbackFilter, additionalMongoFilter);
            }

            return await DbSet.Find(combinedFallback).ToListAsync();
        }

        private static FilterDefinition<T> BuildFallbackTextFilter(string searchText)
        {
            var terms = (searchText ?? string.Empty)
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            if (terms.Length == 0)
            {
                return Builders<T>.Filter.Empty;
            }

            var perTermFilters = new List<FilterDefinition<T>>();
            foreach (var term in terms)
            {
                var escaped = System.Text.RegularExpressions.Regex.Escape(term);
                var regex = new BsonRegularExpression(escaped, "i");

                var anyFieldForTerm = new BsonDocument("$or", new BsonArray
                {
                    new BsonDocument("Name", regex),
                    new BsonDocument("UserName", regex),
                    new BsonDocument("ICNoOrPassport", regex),
                    new BsonDocument("Email", regex)
                });

                perTermFilters.Add(new BsonDocumentFilterDefinition<T>(anyFieldForTerm));
            }

            return Builders<T>.Filter.And(perTermFilters);
        }
    }
}
