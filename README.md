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
- `mobile-app/CreditTracker`: React Native mobile app for Android and iOS

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

4. **API Documentation**
   - Swagger UI available at `/swagger` when running the API.

## Usage

- Register a new user (role: Customer)
- Login to receive JWT token
- Use token to access protected endpoints for credit entry management

## Mobile App

A React Native mobile application is available in the `mobile-app/CreditTracker` directory. The mobile app provides:

- Cross-platform support (Android & iOS)
- User authentication (login, registration, OTP verification)
- Credit entry management (view, create, update, delete)
- Customer search functionality
- Profile management

See `mobile-app/CreditTracker/README.md` for detailed setup instructions.

## License

MIT
