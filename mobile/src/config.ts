// ─── API Configuration ────────────────────────────────────────────────────────
// Change this to your actual server address.
//
// Android Emulator  → 10.0.2.2  (maps to host machine localhost)
// iOS Simulator     → localhost  (or your machine IP on real device)
// Real device       → <YOUR_MACHINE_IP>  (e.g. 192.168.1.5)
//
// You can override this by creating a `.env` file and adding:
//   EXPO_PUBLIC_API_URL=http://192.168.1.5:5000

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000';
