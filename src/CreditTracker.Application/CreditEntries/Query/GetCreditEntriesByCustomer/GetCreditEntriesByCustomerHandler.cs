using Ardalis.Result;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using CreditTracker.Application.Commons;
using BuildingBlocks.Pagination;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Domain.Models;
using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditTracker.Application.CreditEntries.Query.GetCreditEntriesByCustomer
{
    public class GetCreditEntriesByCustomerHandler (IRepository<CreditEntry> creditEntryRepo, ICurrentUserService currentUserService)
        : IQueryHandler<GetCreditEntriesByCustomerQuery, Result<GetCreditEntriesByCustomerResult>>
    {
        public async Task<Result<GetCreditEntriesByCustomerResult>> Handle(GetCreditEntriesByCustomerQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(currentUserService.UserId) || query.CustomerId != currentUserService.UserId)
            {
                throw new ForbiddenException("You cannot list another customer's credit entries.");
            }
            var pageSize = query.PaginationRequest.PageSize;
            var pageIndex = query.PaginationRequest.PageIndex;
            var totalCount = await creditEntryRepo.CountAsync(x => x.IsActive && x.CustomerId == query.CustomerId);
            var creditEntries = await creditEntryRepo.GetByFilterWithPagination(x => x.CustomerId == query.CustomerId && x.IsActive, pageSize, pageSize * (pageIndex - 1));

            if(creditEntries == null || creditEntries.Count == 0)
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
            return Result.Success(new GetCreditEntriesByCustomerResult(preginatedResult));
        }
    }
}
