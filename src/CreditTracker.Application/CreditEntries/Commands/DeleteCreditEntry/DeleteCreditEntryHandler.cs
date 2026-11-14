using Ardalis.Result;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using CreditTracker.Application.Commons;
using CreditTracker.Application.Data;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;


namespace CreditTracker.Application.CreditEntries.Commands.DeleteCreditEntry
{
    public class DeleteCreditEntryHandler(IRepository<CreditEntry> creditEntryRepo, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        : ICommandHandler<DeleteCreditEntryCommand, Result<DeleteCreditEntryResult>>
    {
        public async Task<Result<DeleteCreditEntryResult>> Handle(DeleteCreditEntryCommand command, CancellationToken cancellationToken)
        {
            var creditEntry = await creditEntryRepo.GetById(command.Id);
            if (creditEntry == null || !creditEntry.IsActive)
            {
                throw new CreditEntryNotFoundException(command.Id);
            }
            if (string.IsNullOrEmpty(currentUserService.UserId) || creditEntry.ShopId != currentUserService.UserId)
            {
                throw new ForbiddenException("You cannot delete another shop's credit entry.");
            }
            creditEntry.Remove();
            creditEntryRepo.Update(creditEntry);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new DeleteCreditEntryResult(true));
        }
    }
}
