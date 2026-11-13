using Ardalis.Result;
using BuildingBlocks.CQRS;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditTracker.Application.Customers.Commands.VerifyOtp
{
    // BUG FIX: Changed from IQuery to ICommand — VerifyOtp modifies state (updates user verification),
// so it must be a command to enable the ValidationBehavior pipeline.
public record VerifyOtpCommand(string Id, string Otp) : ICommand<Result<VerifyOtpResult>>;
    public record VerifyOtpResult(bool IsSuccess);

    public class VerifyOtpCommandValidator : AbstractValidator<VerifyOtpCommand>
    {
        public VerifyOtpCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required");
            RuleFor(x => x.Otp).NotEmpty().WithMessage("Otp is required");
        }
    }
}
