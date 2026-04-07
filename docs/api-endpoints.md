# API Endpoints Reference

## Overview

CreditTracker exposes a REST API built with ASP.NET Core Minimal APIs (via Carter). All endpoints use JSON request/response bodies. Authentication is JWT Bearer-based where required.

Base URL (development): `https://localhost:7289` or `http://localhost:5034`

---

## Authentication & User Management

### 1. Create User (Register)

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Route** | `/user` |
| **Auth** | None |

**Request Body:**
```json
{
  "user": {
    "userName": "string",
    "password": "string",
    "name": "string",
    "iCNoOrPassport": "string",
    "role": 2,
    "email": "string",
    "address": "string",
    "latitude": "string",
    "longitude": "string"
  }
}
```

**Validation Rules:**
- `name` – required, non-empty
- `userName` – required, non-empty
- `iCNoOrPassport` – required, non-empty
- `password` – required, non-empty
- `role` – must be `2` (Customer)

**Success Response (200 OK):**
```json
{
  "id": "string (MongoDB ObjectId)"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 Bad Request | Validation error or user already exists |
| 404 Not Found | Resource not found |
| 409 Conflict | Duplicate entry |

**Side Effects:**
- Creates user with `IsVerified = false`
- Generates 6-digit OTP valid for 5 minutes
- Queues OTP delivery (placeholder implementation)

---

### 2. Verify OTP

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Route** | `/users/verifyotp` |
| **Auth** | None |

**Request Body:**
```json
{
  "id": "string (User MongoDB ID)",
  "otp": "string (6-digit code)"
}
```

**Validation Rules:**
- `id` – required, non-empty
- `otp` – required, non-empty

**Success Response (200 OK):**
```json
{
  "isSuccess": true
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 Bad Request | Validation error |
| 404 Not Found | User not found |

**Side Effects:**
- Sets `IsVerified = true` on successful OTP verification
- Clears OTP code from user record

---

### 3. Login

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Route** | `/login` |
| **Auth** | None |

**Request Body:**
```json
{
  "userName": "string",
  "password": "string"
}
```

**Validation Rules:**
- `userName` – required, non-empty
- `password` – required, non-empty

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**JWT Token Details:**
- Claims: `NameIdentifier` (UserId), `Email`, `Role`
- Expires: 7 days from issue
- Algorithm: HMAC-SHA256

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 Bad Request | Invalid password or validation error |
| 404 Not Found | User not found or not verified |

---

### 4. Get Current User

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/user/getcurrentuser` |
| **Auth** | Required (Shop or Customer role) |

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "string",
    "userName": "string",
    "password": "string",
    "name": "string",
    "iCNoOrPassport": "string",
    "role": 1,
    "email": "string",
    "address": "string",
    "latitude": "string",
    "longitude": "string"
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Missing or invalid token |
| 404 Not Found | User not found |

---

### 5. Get User by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/user/{id}` |
| **Auth** | Required (Shop role only) |

**Path Parameters:**
- `id` – User MongoDB ID

**Success Response (200 OK):**
```json
{
  "user": { "...UserDto fields..." }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Missing token or not Shop role |
| 404 Not Found | User not found |

---

### 6. Search Customers

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/user/search/{searchText}` |
| **Auth** | Required (Shop role only) |

**Path Parameters:**
- `searchText` – Text to search for among Customer users

**Success Response (200 OK):**
```json
{
  "users": [
    { "...UserDto fields..." }
  ]
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Missing token or not Shop role |
| 404 Not Found | No customers found |

---

## Credit Entry Management

### 7. Create Credit Entry

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Route** | `/creditentry` |
| **Auth** | Required (Shop role only) |

**Request Body:**
```json
{
  "shopId": "string",
  "customerId": "string",
  "item": "string",
  "amount": 100.50,
  "date": "2024-01-15T10:30:00Z",
  "isPaid": false,
  "paymentDate": null
}
```

**Validation Rules:**
- `item` – required, non-empty
- `amount` – required, greater than 0
- `date` – required, not null
- `shopId` – required, not null/empty
- `customerId` – required, not null/empty

**Success Response (200 OK):**
```json
{
  "id": "string (CreditEntry MongoDB ID)"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 Bad Request | Validation error |
| 401 Unauthorized | Not Shop role |
| 404 Not Found | Shop or Customer user not found |

**Side Effects:**
- Validates both shop and customer users exist
- Caches shop and customer names in entry
- Raises `CreditEntryCreatedEvent`

---

### 8. Get Credit Entry

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/creditentry/{id}` |
| **Auth** | Required (Shop or Customer role) |

**Path Parameters:**
- `id` – CreditEntry MongoDB ID

**Success Response (200 OK):**
```json
{
  "creditEntry": {
    "id": "string",
    "shopId": "string",
    "shopName": "string",
    "customerId": "string",
    "customerName": "string",
    "item": "string",
    "amount": 100.50,
    "date": "2024-01-15T10:30:00Z",
    "isPaid": false,
    "paymentDate": null
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Missing or invalid token |
| 404 Not Found | Credit entry not found |

---

### 9. Update Credit Entry

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Route** | `/creditentry` |
| **Auth** | Required (Shop role only) |

**Request Body:**
```json
{
  "id": "string",
  "isPaid": true,
  "paymentDate": "2024-01-20T14:00:00Z"
}
```

**Success Response (200 OK):**
```json
{
  "isSuccess": true
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Not Shop role |
| 404 Not Found | Credit entry not found |

**Side Effects:**
- Raises `CreditEntryUpdatedEvent`
- Updates audit fields (`ModifiedAt`, `ModifiedBy`)

---

### 10. Delete Credit Entry (Soft Delete)

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Route** | `/creditentry/{id}` |
| **Auth** | Required (Shop role only) |

**Path Parameters:**
- `id` – CreditEntry MongoDB ID

**Success Response (200 OK):**
```json
{
  "isSuccess": true
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Not Shop role |
| 404 Not Found | Credit entry not found |

**Side Effects:**
- Sets `IsActive = false` (soft delete, not permanent removal)

---

### 11. Get Credit Entries by Customer

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/creditentry/getbycustomerid` |
| **Auth** | Required (Customer role only) |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `customerId` | string | required | Customer user ID |
| `pageIndex` | int | 0 | Page number |
| `pageSize` | int | 0 | Records per page |

**Success Response (200 OK):**
```json
{
  "creditEntries": {
    "pageIndex": 1,
    "pageSize": 10,
    "count": 50,
    "data": [
      { "...CreditEntryDto fields..." }
    ]
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 204 No Content | No credit entries found |
| 401 Unauthorized | Not Customer role |

---

### 12. Get Credit Entries by Shop

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/creditentry/getbyshopid` |
| **Auth** | Required (Shop role only) |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `shopId` | string | required | Shop user ID |
| `pageIndex` | int | 0 | Page number |
| `pageSize` | int | 0 | Records per page |

**Success Response (200 OK):**
```json
{
  "creditEntries": {
    "pageIndex": 1,
    "pageSize": 10,
    "count": 50,
    "data": [
      { "...CreditEntryDto fields..." }
    ]
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 204 No Content | No credit entries found |
| 401 Unauthorized | Not Shop role |

---

## Health Check

### 13. Health Check

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/health` |
| **Auth** | None |

**Response:** HealthCheck UI JSON format showing MongoDB connectivity status.

---

## Common Error Response Format

All errors follow the RFC 7231 ProblemDetails format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "ExceptionTypeName",
  "status": 400,
  "detail": "Error description",
  "instance": "/request/path",
  "traceId": "unique-trace-id",
  "validationErrors": ["..."]
}
```

## Authentication Header

For protected endpoints, include:

```
Authorization: Bearer <JWT_TOKEN>
```
