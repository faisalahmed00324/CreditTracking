using Ardalis.Result;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using CreditTracker.Application.Commons;
using BuildingBlocks.Pagination;
using CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByCustomer;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Models;
using Mapster;


namespace CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByShop
{
    internal class GetCreditEntriesByShopHandler(IRepository<CreditEntry> creditEntryRepo, ICurrentUserService currentUserService)
        : IQueryHandler<GetCreditEntriesByShopQuery, Result<GetCreditEntriesByShopResult>>
    {
        public async Task<Result<GetCreditEntriesByShopResult>> Handle(GetCreditEntriesByShopQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(currentUserService.UserId) || query.ShopId != currentUserService.UserId)
            {
                throw new ForbiddenException("You cannot list another shop's credit entries.");
            }
            var pageSize = query.PaginationRequest.PageSize;
            var pageIndex = query.PaginationRequest.PageIndex;
            var totalCount = await creditEntryRepo.CountAsync(x => x.IsActive && x.ShopId == query.ShopId);
            var creditEntries = await creditEntryRepo.GetByFilterWithPagination(x => x.ShopId == query.ShopId && x.IsActive, pageSize, pageSize * (pageIndex - 1));

            if (creditEntries == null || creditEntries.Count == 0)
            {
                return Result.NoContent();
            }
            var creditEntryDtoList = creditEntries.Adapt<List<CreditEntryDto>>();
            var preginatedResult = new PaginationResult<CreditEntryDto>
            (
                pageIndex,
                pageSize,
                totalCount,
                creditEntryDtoList
            );
            return Result.Success(new GetCreditEntriesByShopResult(preginatedResult));
        }
    }
    
}
