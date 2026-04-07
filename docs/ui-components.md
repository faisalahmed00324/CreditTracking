# UI Components Documentation

## Overview

The CreditTracker React frontend is built with **React 19**, **Chakra UI v2**, and **Vite**. It provides a complete interface for all API features with role-based access control.

Location: `client/`

## Architecture

```
client/src/
├── main.jsx                 ← App bootstrap (ChakraProvider, BrowserRouter, AuthProvider)
├── App.jsx                  ← Route definitions
├── api/
│   └── client.js            ← Axios HTTP client with auth interceptors
├── context/
│   └── AuthContext.jsx       ← Global auth state (JWT, user, role)
├── pages/
│   ├── LoginPage.jsx         ← Login form
│   ├── RegisterPage.jsx      ← Multi-step registration + OTP
│   ├── DashboardPage.jsx     ← Role-based dashboard with stats
│   ├── CreditEntriesPage.jsx ← Paginated entry list with CRUD
│   └── CreateCreditEntryPage.jsx ← New credit entry form (Shop only)
└── components/
    ├── Layout.jsx            ← Responsive nav/sidebar layout
    ├── ProtectedRoute.jsx    ← Auth + role guard
    ├── CreditEntryCard.jsx   ← Single entry display card
    ├── CreditEntryForm.jsx   ← Entry creation form
    ├── CustomerSearch.jsx    ← Debounced customer search
    ├── UpdatePaymentModal.jsx ← Mark-as-paid modal
    └── EmptyState.jsx        ← Empty state placeholder
```

---

## Core Modules

### `api/client.js`

Axios HTTP client configuration.

| Feature | Detail |
|---------|--------|
| Base URL | `/api` (proxied to backend via Vite) |
| Auth | Automatically attaches `Authorization: Bearer <token>` from localStorage |
| Error Handling | 401 responses clear auth state and redirect to `/login` |

### `context/AuthContext.jsx`

Global authentication state provider.

**Provided State:**
| Property | Type | Description |
|----------|------|-------------|
| `user` | object \| null | Current user profile |
| `token` | string \| null | JWT token |
| `isAuthenticated` | boolean | Whether user is logged in |
| `isShop` | boolean | Whether user has Shop role |
| `isCustomer` | boolean | Whether user has Customer role |
| `loading` | boolean | Auth initialization loading state |

**Provided Functions:**
| Function | Parameters | Endpoint | Description |
|----------|------------|----------|-------------|
| `login` | `(userName, password)` | `POST /login` | Authenticate and store JWT |
| `register` | `(userData)` | `POST /user` | Register new Customer account |
| `verifyOtp` | `(id, otp)` | `POST /users/verifyotp` | Verify OTP code |
| `logout` | none | none | Clear auth state and localStorage |
| `fetchCurrentUser` | none | `GET /user/getcurrentuser` | Refresh user profile |

---

## Pages

### `LoginPage`

Login form with credentials validation.

| Property | Value |
|----------|-------|
| **Route** | `/login` |
| **Auth Required** | No (redirects to dashboard if already logged in) |
| **Endpoint** | `POST /login` via `AuthContext.login()` |

**Features:**
- Username and password input fields
- Show/hide password toggle
- Loading state during submission
- Error toast on failure
- Link to registration page

---

### `RegisterPage`

Multi-step user registration with OTP verification.

| Property | Value |
|----------|-------|
| **Route** | `/register` |
| **Auth Required** | No |
| **Endpoints** | `POST /user`, `POST /users/verifyotp` |

**Steps:**
1. **Registration Form**: userName, password, name, email, IC/Passport, address, latitude, longitude
2. **OTP Verification**: 6-digit code input

**Validation:** All fields required in step 1. Role is hardcoded to Customer (2).

---

### `DashboardPage`

Role-based overview dashboard.

| Property | Value |
|----------|-------|
| **Route** | `/dashboard` |
| **Auth Required** | Yes (any role) |
| **Endpoints** | `GET /creditentry/getbyshopid` (Shop) or `GET /creditentry/getbycustomerid` (Customer) |

**Displays:**
- Welcome card with user name and role badge
- Statistics cards: Total Entries, Unpaid, Paid, Total Amount
- Quick action cards (View Entries, Create Entry for shops)

---

### `CreditEntriesPage`

Paginated list of credit entries with management actions.

| Property | Value |
|----------|-------|
| **Route** | `/credit-entries` |
| **Auth Required** | Yes (any role) |
| **Endpoints** | `GET /creditentry/getbyshopid`, `GET /creditentry/getbycustomerid`, `DELETE /creditentry/{id}`, `PUT /creditentry` |

**Features:**
- Role-based view (Shop sees entries they created, Customer sees entries against them)
- Pagination with page size of 10
- Delete with confirmation dialog (Shop only)
- Update payment status via modal (Shop only)
- Loading spinner, error alert, and empty state

---

### `CreateCreditEntryPage`

Form to create a new credit entry (Shop role only).

| Property | Value |
|----------|-------|
| **Route** | `/create-entry` |
| **Auth Required** | Yes (Shop only) |
| **Endpoint** | `POST /creditentry` |

**Features:**
- Customer search and selection
- Item, amount, date fields
- Form validation
- Success/error toasts
- Redirects to entries list on success

---

## Components

### `Layout`

Responsive application layout with navigation.

| Prop | Type | Description |
|------|------|-------------|
| (none) | — | Uses React Router `<Outlet>` for child pages |

**Features:**
- Desktop: Fixed sidebar navigation + top bar
- Mobile: Hamburger menu with drawer navigation
- Role-based nav items (Create Entry shown only for Shop)
- User avatar menu with logout option

---

### `ProtectedRoute`

Authentication and authorization guard.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Protected content |
| `allowedRoles` | string[] | undefined | Restrict to specific roles |

**Behavior:**
- Shows loading spinner during auth initialization
- Redirects to `/login` if not authenticated
- Redirects to `/dashboard` if role not in `allowedRoles`

---

### `CreditEntryCard`

Displays a single credit entry as a card.

| Prop | Type | Description |
|------|------|-------------|
| `entry` | object | Credit entry data |
| `isShop` | boolean | Show customer name (true) or shop name (false) |
| `onUpdate` | function | Callback when "Mark as Paid" clicked |
| `onDelete` | function | Callback when "Delete" clicked |

**Displays:** Item name, amount (MYR), date, paid/unpaid badge, customer/shop name. Action buttons visible for Shop role on unpaid entries.

---

### `CreditEntryForm`

Form for creating a new credit entry.

| Prop | Type | Description |
|------|------|-------------|
| `shopId` | string | Current shop's user ID |
| `onSubmit` | function | Callback with form data |
| `loading` | boolean | Submit button loading state |

**Fields:** Customer (via search), Item description, Amount, Date.  
**Validation:** All fields required, amount > 0.

---

### `CustomerSearch`

Debounced search component for finding customers.

| Prop | Type | Description |
|------|------|-------------|
| `onSelect` | function | Callback with selected customer object |

**Endpoint:** `GET /user/search/{searchText}`  
**Features:** 400ms debounce, minimum 2 characters, dropdown results list.

---

### `UpdatePaymentModal`

Modal dialog to mark a credit entry as paid.

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Modal visibility |
| `onClose` | function | Close handler |
| `entry` | object | Credit entry to update |
| `onUpdated` | function | Callback after successful update |

**Endpoint:** `PUT /creditentry`  
**Features:** Date picker for payment date (defaults to today), loading state during update.

---

### `EmptyState`

Reusable placeholder for empty lists/states.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Heading text |
| `description` | string | required | Description text |
| `actionLabel` | string | undefined | Optional action button label |
| `onAction` | function | undefined | Optional action button handler |
| `icon` | component | FiInbox | Custom icon component |

---

## Routes

| Path | Page | Auth | Role |
|------|------|------|------|
| `/login` | LoginPage | No | — |
| `/register` | RegisterPage | No | — |
| `/dashboard` | DashboardPage | Yes | Any |
| `/credit-entries` | CreditEntriesPage | Yes | Any |
| `/create-entry` | CreateCreditEntryPage | Yes | Shop |
| `/` | Redirect to `/dashboard` | — | — |

## Running the Client

```bash
cd client
npm install
npm run dev      # Development server on port 3000
npm run build    # Production build to dist/
npm run preview  # Preview production build
```
