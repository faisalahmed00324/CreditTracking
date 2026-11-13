# Mobile App Overview (Expo)

## Overview

The mobile app in `mobile/` is an Expo React Native client that mirrors the React web app features for both Android and iOS.

Core flows implemented:

- Login and logout
- Customer registration and OTP verification
- Role-aware dashboard (Shop / Customer)
- Credit entry listing with pagination
- Create credit entry (Shop only)
- Mark credit as paid (Shop only)
- Delete credit entry (Shop only)

## Architecture

```
mobile/src/
├── api/
│   ├── client.js            # Axios client + auth interceptor
│   ├── authApi.js           # Login/register/OTP/current user endpoints
│   ├── creditEntryApi.js    # Credit entry CRUD endpoints
│   └── userApi.js           # Customer search endpoint
├── context/
│   └── AuthContext.js       # Auth state, persistence, role flags
├── navigation/
│   ├── RootNavigator.js     # Switches auth/app stacks
│   ├── AuthStack.js         # Login + Register
│   └── AppStack.js          # Dashboard + app screens
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── DashboardScreen.js
│   ├── CreditEntriesScreen.js
│   └── CreateCreditEntryScreen.js
├── components/
│   ├── CreditEntryCard.js
│   ├── CustomerSearchModal.js
│   ├── UpdatePaymentModal.js
│   ├── EmptyState.js
│   ├── FormField.js
│   ├── PrimaryButton.js
│   └── ScreenContainer.js
└── utils/
    └── format.js
```

## How the app works

1. App boots through `App.js`, wraps providers, and mounts navigation.
2. `AuthContext` hydrates `token` and `user` from AsyncStorage.
3. `RootNavigator` decides whether to show `AuthStack` (logged out) or `AppStack` (logged in).
4. On login:
   - `POST /login` returns JWT
   - token is stored in AsyncStorage
   - `GET /user/getcurrentuser` fetches profile
   - token claims + user profile are merged for role checks
5. API client attaches `Authorization: Bearer <token>` automatically.
6. If API returns `401`, local auth storage is cleared and user is returned to auth flow.

## Role-based behavior

- Customer:
  - can view dashboard and own credit entries
  - cannot create, update payment, or delete entries
- Shop:
  - can view dashboard and own credit entries
  - can create entry, mark paid, and delete

## API base URL

Set `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env`:

- Android emulator: `http://10.0.2.2:5034`
- iOS simulator: `http://localhost:5034`
- Physical device: `http://<your-local-ip>:5034`

Ensure backend CORS allows your Expo source when testing from device/browser contexts.
