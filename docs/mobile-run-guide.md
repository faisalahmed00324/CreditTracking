# Mobile Run Guide (Expo)

## Prerequisites

- Node.js 18+
- npm 9+
- Expo Go app on iOS/Android device (optional but recommended)
- For simulator/emulator:
  - iOS: Xcode (macOS)
  - Android: Android Studio + emulator
- Backend API running from repository root:

```bash
dotnet run --project src/CreditTracker.Api/CreditTracker.Api.csproj
```

## 1) Install dependencies

```bash
cd mobile
npm install
```

## 2) Configure API URL

Create a `.env` file in `mobile/`:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5034
```

Use the right value for your runtime:

- Android emulator: `http://10.0.2.2:5034`
- iOS simulator: `http://localhost:5034`
- Physical device: `http://<your-local-ip>:5034`

## 3) Start Expo

```bash
npm start
```

From terminal options:

- `a` = open Android emulator
- `i` = open iOS simulator
- `w` = open web (if needed)

Or run directly:

```bash
npm run android
npm run ios
```

## 4) Login / test flow

1. Register a new customer and verify OTP
2. Login
3. Open dashboard and entries
4. For shop account, verify create/update/delete entry flow

## Troubleshooting

- **Cannot reach API from device**
  - Use laptop LAN IP instead of localhost
  - Ensure phone and laptop are on same network
- **Unauthorized (401) loops**
  - Clear app storage / reinstall Expo Go session
  - Re-login to refresh token
- **Android emulator API error**
  - Confirm URL uses `10.0.2.2`, not `localhost`
- **Network/SSL issues**
  - Prefer HTTP endpoint (`http://localhost:5034`) for local mobile testing

## Build notes

This setup is Expo-managed and ready for EAS builds later if you want installable APK/IPA workflows.
