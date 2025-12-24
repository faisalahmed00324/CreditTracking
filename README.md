# CreditTracker

CreditTracker is a .NET 9.0 solution for tracking credit entries between shops and customers, built with MongoDB as the backend database. It provides APIs for user management, authentication, and credit entry operations.

## Features

- User registration and authentication (JWT-based)
- OTP verification for new users
- Role-based authorization (Shop, Customer)
- CRUD operations for credit entries
- Pagination support for listing credit entries
- Health checks for MongoDB

## Project Structure

- `src/CreditTracker.Api`: ASP.NET Core Web API endpoints
- `src/CreditTracker.Application`: Application logic, CQRS handlers, DTOs, validation
- `src/CreditTracker.Domain`: Domain models and abstractions
- `src/CreditTracker.Infrastructure`: MongoDB repositories and mappings
- `src/BuildingBlocks/BuildingBlocks`: Shared utilities, CQRS, exception handling
- `tests/`: Unit test projects
  - `tests/BuildingBlocks.Tests`: Tests for shared utilities
  - `tests/CreditTracker.Domain.Tests`: Tests for domain models
  - `tests/CreditTracker.Application.Tests`: Tests for application handlers and validators

## Getting Started

1. **Prerequisites**
   - .NET 9.0 SDK
   - MongoDB running locally (`mongodb://localhost:27017`)

2. **Configuration**
   - Update `src/CreditTracker.Api/appsettings.json` for database and JWT settings.

3. **Build and Run**
   ```sh
   dotnet build CreditTracker.sln
   dotnet run --project src/CreditTracker.Api/CreditTracker.Api.csproj
   ```

4. **Run Tests**
   ```sh
   dotnet test CreditTracker.sln
   ```

5. **API Documentation**
   - Swagger UI available at `/swagger` when running the API.

## Testing

The project includes comprehensive unit tests covering:

- **BuildingBlocks**: PasswordHasher utility functions (10 tests)
- **Domain Models**: User and CreditEntry entities with business logic (16 tests)
- **Application Layer**: Command handlers, query handlers, and validators (30 tests)

**Total: 56 unit tests, 100% passing**

Test frameworks used:
- xUnit for test runner
- Moq for mocking dependencies
- FluentAssertions for readable assertions

## Usage

- Register a new user (role: Customer)
- Login to receive JWT token
- Use token to access protected endpoints for credit entry management

## License

MIT
