# CreditTracker

CreditTracker is a .NET 9.0 solution for tracking credit entries between shops and customers, built with MongoDB as the backend database. It provides APIs for user management, authentication, and credit entry operations.

## Features

- User registration and authentication (JWT-based)
- OTP verification for new users
- Role-based authorization (Shop, Customer)
- CRUD operations for credit entries
- Pagination support for listing credit entries
- Health checks for MongoDB
- **Modern React frontend application**

## Project Structure

### Backend
- `src/CreditTracker.Api`: ASP.NET Core Web API endpoints
- `src/CreditTracker.Application`: Application logic, CQRS handlers, DTOs, validation
- `src/CreditTracker.Domain`: Domain models and abstractions
- `src/CreditTracker.Infrastructure`: MongoDB repositories and mappings
- `src/BuildingBlocks/BuildingBlocks`: Shared utilities, CQRS, exception handling

### Frontend
- `frontend/`: React application with Vite
  - Complete UI for all API features
  - Role-based dashboards for Shop and Customer users
  - Responsive design

## Getting Started

### Prerequisites
- .NET 9.0 SDK
- MongoDB running locally (`mongodb://localhost:27017`)
- Node.js 18+ and npm (for frontend)

### Backend Setup

1. **Configuration**
   - Update `src/CreditTracker.Api/appsettings.json` for database and JWT settings.

2. **Build and Run**
   ```sh
   dotnet build CreditTracker.sln
   dotnet run --project src/CreditTracker.Api/CreditTracker.Api.csproj
   ```

3. **API Documentation**
   - Swagger UI available at `/swagger` when running the API.

### Frontend Setup

1. **Navigate to frontend directory**
   ```sh
   cd frontend
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment**
   ```sh
   cp .env.example .env
   # Update VITE_API_URL if backend runs on a different port
   ```

4. **Start development server**
   ```sh
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173 in your browser

## Usage

### User Roles

1. **Shop (Role = 1)**
   - Create, update, and delete credit entries
   - Search and view customers
   - Mark entries as paid/unpaid
   - View dashboard with statistics

2. **Customer (Role = 2)**
   - View personal credit entries
   - Track paid and unpaid credits
   - View dashboard with credit statistics

### Getting Started with the App

1. Register a new user as Customer (or have a Shop user created)
2. Verify your account with the OTP sent to your email
3. Login to receive JWT token
4. Access role-specific features through the dashboard

## API Endpoints

### Authentication
- `POST /login` - Login with username/password
- `POST /users/verifyotp` - Verify OTP after registration

### User Management
- `POST /user` - Register new user (Customer role)
- `GET /user/getcurrentuser` - Get logged in user details
- `GET /user/{id}` - Get user by ID (Shop only)
- `GET /user/{searchText}` - Search customers (Shop only)

### Credit Entry Management
- `POST /creditentry` - Create credit entry (Shop only)
- `PUT /creditentry` - Update credit entry (Shop only)
- `DELETE /creditentry/{id}` - Delete credit entry (Shop only)
- `GET /creditentry/{id}` - Get single credit entry
- `GET /creditentry/getbyshopid` - Get entries by shop (Shop only)
- `GET /creditentry/getbycustomerid` - Get entries by customer (Customer only)

## Technology Stack

### Backend
- .NET 9.0
- ASP.NET Core Web API
- MongoDB
- MediatR (CQRS pattern)
- FluentValidation
- JWT Authentication
- Carter (minimal APIs)

### Frontend
- React 18
- React Router v6
- Axios
- Vite
- CSS3

## License

MIT
