# CreditTracker

A full-stack credit management application built with **.NET 10, ASP.NET Core, React, and MongoDB**. CreditTracker helps shops manage customer credit transactions, track outstanding payments, and maintain transaction history.

## Features

- User registration and JWT-based authentication
- OTP-based account verification flow
- Role-based authorization for Shop and Customer users
- Customer search and management
- Create, view, update, and soft-delete credit entries
- Payment status and payment date tracking
- Paginated credit entry listings
- MongoDB health checks
- React-based frontend with responsive UI components

> **Note:** OTP generation and verification are implemented, but actual email/SMS delivery requires integration with an external messaging provider.

## Technology Stack

### Backend
- C#
- .NET 10
- ASP.NET Core Web API
- CQRS and MediatR
- MongoDB
- JWT Bearer Authentication
- FluentValidation
- Carter
- Swagger / OpenAPI

### Frontend
- React 19
- Vite
- JavaScript
- Chakra UI
- Axios
- React Router

### Testing
- xUnit
- Vitest
- React Testing Library

## Architecture

The backend follows a layered architecture with separation of concerns between the API, application logic, domain models, and infrastructure.

```text
CreditTracker
│
├── src
│   ├── CreditTracker.Api
│   │   └── API endpoints, authentication, middleware
│   │
│   ├── CreditTracker.Application
│   │   └── CQRS handlers, DTOs, validation
│   │
│   ├── CreditTracker.Domain
│   │   └── Entities, aggregates, domain events
│   │
│   ├── CreditTracker.Infrastructure
│   │   └── MongoDB repositories, persistence
│   │
│   └── BuildingBlocks
│       └── Shared CQRS interfaces, behaviors, exceptions
│
├── client
│   └── React application
│
├── docs
│   ├── api-endpoints.md
│   ├── technical-overview.md
│   └── ui-components.md
│
└── tests
    └── CreditTracker.Application.Tests
```

### Request flow

```text
HTTP Request
    ↓
ASP.NET Core API
    ↓
Carter Endpoint
    ↓
MediatR / CQRS
    ↓
Application Handler
    ↓
Repository / Unit of Work
    ↓
MongoDB
```

## Core Functional Areas

| Area | Capabilities |
|---|---|
| Authentication | Registration, OTP verification, login, JWT |
| User Management | Shop and customer roles, customer search |
| Credit Management | Create, retrieve, update, and soft-delete entries |
| Payment Tracking | Track paid status and payment dates |
| Reporting | Paginated credit entry listings |
| Monitoring | MongoDB health check endpoint |

## Getting Started

### Prerequisites

- .NET 10 SDK
- MongoDB instance
- Node.js and npm

### 1. Clone the repository

```bash
git clone https://github.com/faisalahmed00324/CreditTracking.git
cd CreditTracking
```

### 2. Configure the backend

Configure the database and JWT settings using your local development configuration or .NET User Secrets.

Do not commit real credentials, connection strings, or JWT signing secrets.

### 3. Run the backend

```bash
dotnet restore CreditTracker.sln
dotnet build CreditTracker.sln
dotnet run --project src/CreditTracker.Api/CreditTracker.Api.csproj
```

The API development URLs and ports depend on the local launch configuration. Swagger is available at `/swagger` when enabled.

### 4. Run the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The Vite development server is configured to use port `3000`.

Check the frontend API base URL and Vite proxy configuration against the backend URL used by your local environment.

## Running Tests

### Backend tests

```bash
dotnet test CreditTracker.sln
```

### Frontend tests

```bash
cd client
npm test
```

### Frontend production build

```bash
cd client
npm run build
```

## API Documentation

Detailed endpoint documentation is available in:

- `docs/api-endpoints.md`
- `docs/technical-overview.md`

## Project Purpose

This project demonstrates full-stack application development using modern .NET and React technologies, with an emphasis on layered architecture, CQRS, authentication, MongoDB persistence, and frontend/backend integration.

## License

Add a repository license file if you intend to distribute this project under an open-source license.
