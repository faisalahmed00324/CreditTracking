# CreditTracker

CreditTracker is a full-stack application for tracking credit entries between shops and customers. It consists of a .NET 9.0 backend API with MongoDB and a React frontend built with Chakra UI.

## Features

- User registration and authentication (JWT-based)
- OTP verification for new users
- Role-based authorization (Shop, Customer)
- CRUD operations for credit entries
- Pagination support for listing credit entries
- Health checks for MongoDB
- Modern React frontend with Chakra UI
- Separate dashboards for shops and customers

## Project Structure

### Backend
- `src/CreditTracker.Api`: ASP.NET Core Web API endpoints
- `src/CreditTracker.Application`: Application logic, CQRS handlers, DTOs, validation
- `src/CreditTracker.Domain`: Domain models and abstractions
- `src/CreditTracker.Infrastructure`: MongoDB repositories and mappings
- `src/BuildingBlocks/BuildingBlocks`: Shared utilities, CQRS, exception handling

### Frontend
- `client/`: React application with Chakra UI
  - See [client/README.md](client/README.md) for detailed frontend documentation

## Getting Started

### Prerequisites
- .NET 9.0 SDK
- Node.js 18+ and npm
- MongoDB running locally (`mongodb://localhost:27017`)

### Backend Setup

1. **Configuration**
   - Update `src/CreditTracker.Api/appsettings.json` for database and JWT settings.

2. **Build and Run**
   ```sh
   dotnet build CreditTracker.sln
   dotnet run --project src/CreditTracker.Api/CreditTracker.Api.csproj
   ```

3. **API Documentation**
   - Swagger UI available at `http://localhost:5000/swagger` when running the API.

### Frontend Setup

1. **Navigate to client directory**
   ```sh
   cd client
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment**
   ```sh
   cp .env.example .env
   ```
   Edit `.env` to set `VITE_API_BASE_URL` (default: `http://localhost:5000`)

4. **Run development server**
   ```sh
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - API Documentation: `http://localhost:5000/swagger`

## Usage

1. **Register a new user**
   - Choose role: Shop (0) or Customer (1)
   - Verify email with OTP

2. **Login**
   - Use credentials to receive JWT token
   - Redirected to appropriate dashboard based on role

3. **Shop Dashboard**
   - Create credit entries for customers
   - Search for customers
   - Mark entries as paid
   - View all credit entries

4. **Customer Dashboard**
   - View all credit entries
   - Track outstanding balance
   - See payment history

## Development

### Backend
- The API uses Carter for minimal API endpoints
- JWT authentication with role-based authorization
- MongoDB for data persistence
- CQRS pattern with MediatR

### Frontend
- React 19 with Vite
- Chakra UI v3 for components
- React Router for navigation
- Axios for API calls
- Context API for authentication state

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative port)

## License

MIT
