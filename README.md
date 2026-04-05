# CreditTracker

CreditTracker is a .NET 9.0 solution for tracking credit entries between shops and customers, built with MongoDB as the backend database. It provides APIs for user management, authentication, and credit entry operations.

## Features

- User registration and authentication (JWT-based)
- OTP verification for new users
- Role-based authorization (Shop, Customer)
- CRUD operations for credit entries
- Pagination support for listing credit entries
- Health checks for MongoDB
- Prometheus metrics endpoint at `/metrics`
- Grafana dashboards for real-time observability

## Project Structure

- `src/CreditTracker.Api`: ASP.NET Core Web API endpoints
- `src/CreditTracker.Application`: Application logic, CQRS handlers, DTOs, validation
- `src/CreditTracker.Domain`: Domain models and abstractions
- `src/CreditTracker.Infrastructure`: MongoDB repositories and mappings
- `src/BuildingBlocks/BuildingBlocks`: Shared utilities, CQRS, exception handling
- `monitoring/prometheus/`: Prometheus scrape configuration
- `monitoring/grafana/`: Grafana provisioning (datasources and dashboards)

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

## Monitoring with Prometheus & Grafana

The full monitoring stack (API + MongoDB + Prometheus + Grafana) can be started with a single Docker Compose command.

### Start the monitoring stack

1. Copy the example environment file and fill in your secrets:
   ```sh
   cp .env.example .env
   # Edit .env and set JWT_SECRET and GRAFANA_ADMIN_PASSWORD
   ```

2. Start all services:
   ```sh
   docker-compose up --build
   ```

### Service URLs

| Service    | URL                          | Notes                         |
|------------|------------------------------|-------------------------------|
| API        | http://localhost:8080/swagger | Swagger UI                    |
| API Health | http://localhost:8080/health  | MongoDB health check          |
| Metrics    | http://localhost:8080/metrics | Prometheus scrape endpoint    |
| Prometheus | http://localhost:9090         | Query and explore raw metrics |
| Grafana    | http://localhost:3000         | Dashboards (admin / admin)    |

### Grafana dashboard

After `docker-compose up`, open Grafana at http://localhost:3000 and log in with `admin` / `admin`.  
A pre-provisioned **CreditTracker API** dashboard is available under *Dashboards → CreditTracker API*.

It includes the following panels:

- **HTTP Request Rate** – requests per second broken down by HTTP status code
- **HTTP Request Duration** – p50, p95, and p99 latencies per endpoint
- **HTTP Requests In Progress** – live count of active requests
- **Total HTTP Requests** – cumulative request counter
- **Memory Usage** – working set, private memory, and .NET GC heap
- **Thread Count** – number of OS threads used by the process

### Stopping the stack

```sh
docker-compose down
```

To also remove persisted data (MongoDB, Prometheus, Grafana volumes):

```sh
docker-compose down -v
```

## Usage

- Register a new user (role: Customer)
- Login to receive JWT token
- Use token to access protected endpoints for credit entry management

## License

MIT

