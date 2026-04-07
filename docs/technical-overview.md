# Technical Overview

## Architecture Overview

CreditTracker is a .NET 9.0 ASP.NET Core Web API for tracking credit entries between shops and customers. It follows **Clean Architecture** with **CQRS** (Command Query Responsibility Segregation) using MediatR.

### Layer Diagram

```
┌─────────────────────────────────────────┐
│           CreditTracker.Api             │  ← Endpoints, Auth, Swagger, DI
│           (Presentation Layer)          │
├─────────────────────────────────────────┤
│       CreditTracker.Application         │  ← Commands, Queries, Validators, DTOs
│           (Business Logic)              │
├─────────────────────────────────────────┤
│         CreditTracker.Domain            │  ← Entities, Aggregates, Events, Enums
│           (Domain Layer)                │
├─────────────────────────────────────────┤
│      CreditTracker.Infrastructure       │  ← MongoDB Repositories, UoW, DbContext
│         (Data Access Layer)             │
├─────────────────────────────────────────┤
│           BuildingBlocks                │  ← Shared CQRS interfaces, Behaviors,
│          (Shared Kernel)                │    Exceptions, Helpers, Pagination
└─────────────────────────────────────────┘
```

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 9.0 | Runtime |
| ASP.NET Core | 9.0 | Web framework |
| Carter | 9.0.0 | Minimal API module routing |
| MediatR | 12.5.0 | CQRS mediator pattern |
| MongoDB.Driver | 3.3.0 | Database driver |
| FluentValidation | 11.11.0 | Input validation |
| Mapster | 7.4.0 | Object mapping |
| Ardalis.Result | 10.1.0 | Result pattern |
| JWT Bearer | 9.0.4 | Authentication |
| Swashbuckle | 8.1.1 | OpenAPI documentation |

### Request Pipeline

```
HTTP Request
  → Carter Routing
    → Authentication/Authorization Middleware
      → MediatR Pipeline
        → LoggingBehavior (logs timing)
        → ValidationBehavior (FluentValidation, commands only)
          → Command/Query Handler
            → Repository Layer
              → MongoDB
```

---

## Data Models and Relationships

### Entity Base Classes

```
IEntity<T>
  └── Entity<T>           (Id, CreatedAt, CreatedBy, ModifiedAt, ModifiedBy, IsActive)
        └── Aggregate<T>   (DomainEvents list)
```

### User Entity

| Field | Type | Description |
|-------|------|-------------|
| Id | string | MongoDB ObjectId (auto-generated) |
| UserName | string | Unique login username |
| Email | string | User email address |
| PasswordHash | string | PBKDF2-SHA256 hashed password |
| Role | Role enum | `Shop (1)` or `Customer (2)` |
| Name | string | Display name |
| ICNoOrPassport | string | Identity document number |
| Address | string | Physical address |
| Latitude | string | Geo-location latitude |
| Longitude | string | Geo-location longitude |
| OtpCode | string | One-time password for verification |
| OtpExpiry | DateTime | OTP expiration timestamp |
| IsVerified | bool | Whether OTP verification passed |
| IsActive | bool | Soft-delete flag |
| CreatedAt | DateTime? | Record creation timestamp |
| CreatedBy | string? | Creator user ID |
| ModifiedAt | DateTime? | Last modification timestamp |
| ModifiedBy | string? | Last modifier user ID |

### CreditEntry Entity (Aggregate Root)

| Field | Type | Description |
|-------|------|-------------|
| Id | string | MongoDB ObjectId (auto-generated) |
| ShopId | string | Reference to Shop user |
| ShopName | string | Cached shop display name |
| CustomerId | string | Reference to Customer user |
| CustomerName | string | Cached customer display name |
| Item | string | Product or service description |
| Amount | decimal | Credit amount |
| Date | DateTime | Transaction date |
| IsPaid | bool | Payment status |
| PaymentDate | DateTime? | Date payment was made |
| IsActive | bool | Soft-delete flag |

### Relationships

```
User (Shop) ──1:N──► CreditEntry ◄──N:1── User (Customer)
```

- A **Shop** user creates credit entries for **Customer** users
- Shop and Customer names are **denormalized** (cached) in each CreditEntry
- Relationships are via string ID references (no foreign key constraints in MongoDB)

### Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `CreditEntryCreatedEvent` | `CreditEntry.Create()` | The new CreditEntry |
| `CreditEntryUpdatedEvent` | `CreditEntry.Update()` | The updated CreditEntry |

---

## Business Logic and Rules per Endpoint

### User Registration (`POST /user`)
1. Check if a verified, active user with the same username already exists
2. Generate 6-digit OTP with 5-minute expiry
3. Hash password using PBKDF2-SHA256 (100,000 iterations)
4. Create User entity with `IsVerified = false`
5. Persist to MongoDB
6. Queue OTP delivery (placeholder implementation)
7. Only `Customer` role (value `2`) is allowed for self-registration

### OTP Verification (`POST /users/verifyotp`)
1. Look up user by ID
2. Compare OTP code and check expiry (`OtpExpiry >= DateTime.UtcNow`)
3. On success: set `IsVerified = true`, clear OTP code
4. On failure: return `IsSuccess = false`

### Login (`POST /login`)
1. Find verified, active user by username
2. Verify password hash using constant-time comparison
3. Generate JWT with claims: NameIdentifier, Email, Role
4. Token valid for 7 days

### Get Current User (`GET /user/getcurrentuser`)
1. Extract user ID from JWT `NameIdentifier` claim
2. Fetch user from repository by ID
3. Available to both Shop and Customer roles

### Get User by ID (`GET /user/{id}`)
1. Fetch user by MongoDB ID
2. Restricted to Shop role only

### Search Customers (`GET /user/search/{searchText}`)
1. MongoDB text search on Customer users only
2. Restricted to Shop role only

### Create Credit Entry (`POST /creditentry`)
1. Validate both Shop and Customer users exist and are active
2. Cache shop name and customer name in entry
3. Create CreditEntry aggregate (raises domain event)
4. Restricted to Shop role only

### Get Credit Entry (`GET /creditentry/{id}`)
1. Fetch single entry by ID
2. Available to both Shop and Customer roles

### Update Credit Entry (`PUT /creditentry`)
1. Fetch existing entry by ID
2. Update `IsPaid` and `PaymentDate` fields only
3. Raises `CreditEntryUpdatedEvent`
4. Restricted to Shop role only

### Delete Credit Entry (`DELETE /creditentry/{id}`)
1. Fetch entry by ID
2. Set `IsActive = false` (soft delete)
3. Restricted to Shop role only

### Get Credit Entries by Customer (`GET /creditentry/getbycustomerid`)
1. Filter by `CustomerId` and `IsActive = true`
2. Paginated results
3. Returns 204 No Content if no entries found
4. Restricted to Customer role only

### Get Credit Entries by Shop (`GET /creditentry/getbyshopid`)
1. Filter by `ShopId` and `IsActive = true`
2. Paginated results
3. Returns 204 No Content if no entries found
4. Restricted to Shop role only

---

## Authentication and Authorization Flow

### Registration → Verification → Login Flow

```
1. POST /user (register)
   ├── Creates unverified user
   └── Returns user ID + generates OTP

2. POST /users/verifyotp
   ├── Validates OTP code and expiry
   └── Sets IsVerified = true

3. POST /login
   ├── Validates username + password
   ├── Checks IsVerified = true
   └── Returns JWT token (7-day expiry)

4. Subsequent requests
   └── Authorization: Bearer <token>
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "userId",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "user@email.com",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Shop",
    "exp": 1234567890,
    "iss": "https://localhost:7289",
    "aud": "https://localhost:7289"
  }
}
```

### Authorization Policies

| Policy | Required Role | Endpoints |
|--------|--------------|-----------|
| ShopPolicy | `Shop` | Get User by ID, Search Customers, Create/Update/Delete Credit Entry, Get Credit Entries by Shop |
| CustomerPolicy | `Customer` | Get Credit Entries by Customer |
| Shop or Customer | Either role | Get Current User, Get Credit Entry by ID |
| None | Public | Register, Verify OTP, Login, Health Check |

### Password Security

- Algorithm: PBKDF2 with SHA-256
- Salt: 128 bits (16 bytes), random per user
- Key size: 256 bits (32 bytes)
- Iterations: 100,000
- Storage: Base64(salt + derivedKey)
- Verification: Constant-time comparison (prevents timing attacks)

---

## Known Issues and Inconsistencies (Fixed)

The following issues were found during codebase analysis and have been fixed:

### 1. VerifyOtp CQRS Interface Mismatch (FIXED)
**Files:** `VerifyOtpCommand.cs`, `VerifyOtpHandler.cs`
**Issue:** VerifyOtp modifies database state (updates user verification status) but was implemented as `IQuery`/`IQueryHandler` instead of `ICommand`/`ICommandHandler`. This meant FluentValidation was bypassed since `ValidationBehavior` only applies to `ICommand`.
**Fix:** Changed to `ICommand`/`ICommandHandler` interfaces.

### 2. Route Conflict: SearchCustomer vs GetUserById (FIXED)
**Files:** `SearchCustomer.cs`, `GetUserById.cs`
**Issue:** Both endpoints used `GET /user/{parameter}` — ASP.NET Core cannot distinguish between `/user/{id}` and `/user/{searchText}`.
**Fix:** Changed SearchCustomer route to `GET /user/search/{searchText}`.

### 3. Multiple Incorrect Swagger Response Types (FIXED)
**Files:** `SearchCustomer.cs`, `GetCurrentUser.cs`, `GetUserById.cs`, `VerifyOtp.cs`, `GetCreditEntriesByCustomer.cs`, `GetCreditEntriesByShop.cs`
**Issue:** Several endpoints had wrong `.Produces<T>()` type declarations — referencing response types from unrelated endpoints.
**Fix:** Corrected each to use its own response type.

### 4. Typo in Record Name (FIXED)
**File:** `GetCreditEntriesByCustomer.cs`
**Issue:** Record named `GetCreditEntriesByCustomerRespopnse` (misspelled).
**Fix:** Renamed to `GetCreditEntriesByCustomerResponse`.

### 5. Weak OTP Generation (FIXED)
**File:** `CreateUserHandler.cs`
**Issue:** `new Random()` created per call can produce identical values when called in quick succession.
**Fix:** Changed to use `Random.Shared` which is thread-safe and properly seeded.

### 6. Placeholder SendOtp Implementation
**File:** `CreateUserHandler.cs`
**Issue:** `SendOtp()` method just counts OTP records instead of actually sending. This is a known placeholder — requires SMS/email service integration.
**Status:** Documented but not fixed (requires external service integration).

### 7. Unused Imports (FIXED)
**File:** `CreateUserHandler.cs`
**Issue:** Multiple unused `using` statements (`MediatR`, `Microsoft.VisualBasic`, `System.Net.WebSockets`, etc.).
**Fix:** Removed all unused imports.
