# Credit Tracker Mobile App

A cross-platform mobile application for tracking credit entries between shops and customers. This app works on both Android and iOS devices.

## Features

- **User Authentication**: Login and registration with OTP verification
- **Credit Entry Management**: 
  - View list of credit entries
  - Create new credit entries (Shop owners)
  - View entry details
  - Mark entries as paid (Shop owners)
  - Delete entries (Shop owners)
- **Customer Search**: Search for customers when creating entries
- **Profile Management**: View account information and logout

## Technology Stack

- **Framework**: React Native 0.82
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **API**: REST API integration with JWT authentication

## Project Structure

```
src/
├── api/              # API configuration and services
├── components/       # Reusable UI components
├── context/          # React Context for state management
├── navigation/       # Navigation configuration
├── screens/          # Screen components
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Prerequisites

Before you begin, ensure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment):

- Node.js >= 20
- npm or Yarn
- For Android: Android Studio and Android SDK
- For iOS: Xcode and CocoaPods (macOS only)

## Installation

1. Navigate to the mobile app directory:
   ```sh
   cd mobile-app/CreditTracker
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. For iOS, install CocoaPods dependencies:
   ```sh
   cd ios
   pod install
   cd ..
   ```

## Configuration

Update the API base URL in `src/api/config.ts` to match your backend server:

```typescript
// For Android emulator (localhost)
export const API_BASE_URL = 'http://10.0.2.2:5289';

// For iOS simulator (localhost)
export const API_BASE_URL = 'http://localhost:5289';

// For production
export const API_BASE_URL = 'https://your-api-server.com';
```

## Running the App

### Start Metro Bundler

```sh
npm start
```

### Android

```sh
npm run android
```

### iOS

```sh
npm run ios
```

## API Endpoints Used

The mobile app connects to the following API endpoints:

### Authentication
- `POST /login` - User login
- `POST /users/verifyotp` - OTP verification

### User Management
- `POST /user` - Create new user (registration)
- `GET /user/getcurrentuser` - Get current user details
- `GET /user/{id}` - Get user by ID
- `GET /user/{searchText}` - Search customers

### Credit Entries
- `POST /creditentry` - Create credit entry
- `GET /creditentry/{id}` - Get credit entry by ID
- `GET /creditentry/getbycustomerid` - Get entries by customer (with pagination)
- `GET /creditentry/getbyshopid` - Get entries by shop (with pagination)
- `PUT /creditentry` - Update credit entry (mark as paid)
- `DELETE /creditentry/{id}` - Delete credit entry

## User Roles

- **Shop (Role = 1)**: Can create, view, update, and delete credit entries
- **Customer (Role = 2)**: Can view their own credit entries

## Testing

```sh
npm run test
```

## Linting

```sh
npm run lint
```

## Troubleshooting

If you encounter issues:

1. Clear Metro cache:
   ```sh
   npm start -- --reset-cache
   ```

2. For Android, clean the build:
   ```sh
   cd android && ./gradlew clean && cd ..
   ```

3. For iOS, clean and reinstall pods:
   ```sh
   cd ios && rm -rf Pods && pod install && cd ..
   ```

For more troubleshooting help, visit the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).
