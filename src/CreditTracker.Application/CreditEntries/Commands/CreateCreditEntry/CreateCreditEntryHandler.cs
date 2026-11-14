using Ardalis.Result;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using CreditTracker.Application.Commons;
using CreditTracker.Application.Data;
using CreditTracker.Application.Dtos;
using CreditTracker.Application.Exception;
using CreditTracker.Domain.Models;


namespace CreditTracker.Application.CreditEntries.Commands.CreateCreditEntry
{
    public class CreateCreditEntryHandler(IRepository<CreditEntry> creditEntryRepository, IRepository<User> userRepository, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        : ICommandHandler<CreateCreditEntryCommand, Result<CreateCreditEntryResult>>
    {
        public async Task<Result<CreateCreditEntryResult>> Handle(CreateCreditEntryCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(currentUserService.UserId) || command.ShopId != currentUserService.UserId)
            {
                throw new ForbiddenException("You cannot create credit entries for another shop.");
            }
            var creditEntry = await CreateNew(command);
            creditEntryRepository.Add(creditEntry);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new CreateCreditEntryResult(creditEntry.Id));
        }

        private async Task<CreditEntry> CreateNew(CreateCreditEntryCommand command)
        {
            var customer = await userRepository.GetSingle(x => x.Id == command.CustomerId && x.IsActive);
            var shop = await userRepository.GetSingle(x => x.Id == command.ShopId && x.IsActive);
            if (customer == null) 
            {
                throw new UserNotFoundException(command.CustomerId);
            }
            if (shop == null)
            {
                throw new UserNotFoundException(command.ShopId);
            }
            return CreditEntry.Create(command.ShopId, shop.Name, command.CustomerId, customer.Name, command.Item, command.Amount, command.Date,
                command.IsPaid, command.PaymentDate);
        }

    }
}
