/**
 * API Base URL Configuration
 *
 * Priority order:
 *   1. REACT_APP_API_URL env variable (set in .env or at build time)
 *   2. Auto-detect: if running inside Capacitor native shell, use 10.0.2.2 (Android emulator)
 *   3. Fallback to localhost for web development
 *
 * For a PHYSICAL Android device running against a local backend:
 *   - Set REACT_APP_API_URL=http://<YOUR_LAN_IP>:5000 in .env before building
 *   - Or edit this file directly and rebuild + cap sync
 */

function resolveApiBaseUrl() {
  // 1. Explicit env var always wins
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Detect Capacitor native context (Android/iOS)
  const isNative =
    typeof window !== 'undefined' &&
    window.Capacitor &&
    window.Capacitor.isNativePlatform &&
    window.Capacitor.isNativePlatform();

  if (isNative) {
    // 10.0.2.2 maps to host machine's localhost on Android emulator.
    // For a physical device, override via REACT_APP_API_URL instead.
    return 'http://10.0.2.2:5000';
  }

  // 3. Default for web development
  return 'http://localhost:5000';
}

export const API_BASE_URL = resolveApiBaseUrl();
