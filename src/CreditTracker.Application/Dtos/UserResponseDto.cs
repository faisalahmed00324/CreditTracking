using CreditTracker.Domain.Enum;

namespace CreditTracker.Application.Dtos
{
    // Safe response model: deliberately excludes credentials and password hashes.
    public record UserResponseDto(
        string Id, string UserName, string Name, string ICNoOrPassport,
        Role Role, string Email, string Address, string Latitude, string Longitude
    );
}
