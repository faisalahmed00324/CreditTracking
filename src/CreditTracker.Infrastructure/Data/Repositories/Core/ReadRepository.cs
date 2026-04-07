using CreditTracker.Application.Data;
using CreditTracker.Domain.Abstractions;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CreditTracker.Infrastructure.Data.Repositories.Core
{
    public abstract class ReadRepository<TEntity> : RepositoryBase<TEntity>, IReadRepository<TEntity> where TEntity : class, IEntity<string>
    {
        protected ReadRepository(IDbContext context) : base(context)
        {
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        public virtual Task<IQueryable<TEntity>> GetAll()
        {
            var all = DbSet.AsQueryable<TEntity>();
            return Task.FromResult<IQueryable<TEntity>>(all);
        }

        public virtual async Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>> predicate)
        {
            var data = await DbSet.FindAsync(predicate);
            return data.ToList();
        }

        public virtual IEnumerable<TEntity> GetAllByIds(List<string> ids)
        {           
            var data = DbSet.Find(x => ids.Contains(x.Id));
            return data.ToEnumerable();
        }

        public virtual async Task<List<TEntity>> GetByFilter(Expression<Func<TEntity, bool>> predicate)
        {
            var data = await DbSet.FindAsync(predicate);
            return data.ToList();
        }
        public virtual async Task<List<TEntity>> GetByFilterWithPagination(Expression<Func<TEntity, bool>> predicate, int limit, int offset)
        {
            var data = await DbSet.Find(predicate).Limit(limit).Skip(offset).ToListAsync();
            return data;
        }

        public virtual async Task<TEntity> GetById(string id)
        {
            var objectId = new ObjectId(id);            
            var data = await DbSet.FindAsync(x => x.Id == id);
            return data.SingleOrDefault();
        }

        public virtual async Task<TEntity> GetSingle(Expression<Func<TEntity, bool>> predicate)
        {
            var data = await DbSet.FindAsync(predicate);
            return data.SingleOrDefault();
        }

        public virtual List<dynamic> GetSingleColumnList(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity, dynamic>> selectPredicate)
        {
            var data = DbSet.Find(predicate)
                        .Project<TEntity>(Builders<TEntity>.Projection.Include(selectPredicate)).ToEnumerable();
            var result = data.Select(selectPredicate.Compile()).ToList();
            return result;
        }
        public async Task<bool> Any(Expression<Func<TEntity, bool>> predicate)
        {
            long count = await DbSet.CountDocumentsAsync(predicate);
            return count > 0;
        }

        public virtual async Task<List<TEntity>> TextSearchAsync(string searchText, Expression<Func<TEntity, bool>>? additionalFilter = null)
        {
            var textFilter = Builders<TEntity>.Filter.Text(searchText);
            FilterDefinition<TEntity> finalFilter = textFilter;
            if (additionalFilter != null)
            {
                var additionalMongoFilter = Builders<TEntity>.Filter.Where(additionalFilter);
                finalFilter = Builders<TEntity>.Filter.And(textFilter, additionalMongoFilter);
            }
            var result = await DbSet.Find(finalFilter).ToListAsync();
            return result;
        }
    }
}
