# Android Build & Run Guide

This guide covers building the Vehicle Health app for Android using Capacitor, running it on an emulator or a physical phone.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | `node -v` to check |
| npm | ≥ 9 | Comes with Node.js |
| Android Studio | Latest stable | [Download](https://developer.android.com/studio) |
| JDK | 17 | Bundled with Android Studio |
| Android SDK | API 34 (compileSdk) | Install via Android Studio SDK Manager |

In Android Studio → **SDK Manager**, ensure these are installed:
- **Android SDK Platform 34**
- **Android SDK Build-Tools 34**
- **Android Emulator** (if using emulator)

---

## Quick Start (4 commands)

```bash
# 1. Install frontend dependencies
npm install

# 2. Build the React app → outputs to build/
npm run build

# 3. Sync build output into the Android project
npx cap sync android

# 4. Open the Android project in Android Studio
npx cap open android
```

Then in Android Studio: **Run → Run 'app'** (or press the green ▶ button).

---

## Running on a Physical Phone via USB

1. **Enable Developer Options** on your phone:
   - Settings → About Phone → tap "Build Number" 7 times
2. **Enable USB Debugging**:
   - Settings → Developer Options → toggle "USB Debugging"
3. Connect phone via USB cable
4. Android Studio should show your device in the device dropdown
5. Click **Run ▶** to install and launch the app

> **Tip:** If the device doesn't appear, run `adb devices` in a terminal. If empty, try a different USB cable or port.

---

## API Endpoint Configuration

The app needs to reach the Flask backend API. The URL is configured in `src/config/api.js`.

### How it works (automatic):

| Environment | API URL | How |
|-------------|---------|-----|
| Web dev (`npm start`) | `http://localhost:5000` | Default fallback |
| Android Emulator | `http://10.0.2.2:5000` | Auto-detected via Capacitor |
| Physical Phone | Must be set manually | See below |

### For a physical Android phone:

The phone can't reach `localhost`. You need your computer's LAN IP.

1. Find your LAN IP:
   ```bash
   # macOS
   ipconfig getifaddr en0

   # Linux
   hostname -I | awk '{print $1}'

   # Windows (PowerShell)
   (Get-NetIPAddress -InterfaceAlias Wi-Fi -AddressFamily IPv4).IPAddress
   ```

2. Set the env variable **before building**:
   ```bash
   # In your .env file (project root):
   REACT_APP_API_URL=http://192.168.1.42:5000

   # Then rebuild:
   npm run build && npx cap sync android
   ```

3. Alternatively, edit `src/config/api.js` directly and rebuild.

4. Make sure both the phone and computer are on the **same Wi-Fi network**.

5. Start the backend on all interfaces:
   ```bash
   python api_server.py
   # Flask typically binds to 0.0.0.0:5000 or 127.0.0.1:5000
   # If it only binds to 127.0.0.1, update to: app.run(host='0.0.0.0', port=5000)
   ```

---

## npm Scripts Reference

| Script | What it does |
|--------|-------------|
| `npm run build` | Creates production React build in `build/` |
| `npm run cap:sync` | Build + sync to Android (shortcut) |
| `npm run cap:android` | Opens the `android/` project in Android Studio |
| `npm run cap:live` | Live-reload on connected device (for development) |

---

## Project Structure (Android-relevant)

```
├── capacitor.config.ts    # Capacitor settings (app ID, webDir, server)
├── src/config/api.js       # API base URL (auto-detects platform)
├── .env                    # REACT_APP_API_URL=http://...
├── build/                  # React build output (synced to Android)
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml    # Permissions, network config
│   │   │   ├── res/xml/
│   │   │   │   └── network_security_config.xml  # HTTP cleartext rules
│   │   │   └── java/com/vehicle/health/
│   │   │       └── MainActivity.java
│   │   └── build.gradle
│   ├── build.gradle
│   └── variables.gradle    # SDK versions, dependency versions
```

---

## Troubleshooting

### Build fails with "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=/Users/<you>/Library/Android/sdk
# or on Linux: sdk.dir=/home/<you>/Android/Sdk
# or on Windows: sdk.dir=C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk
```

### "Unable to connect to API" on phone
- Ensure backend is running: `python api_server.py`
- Ensure phone and computer are on the same network
- Check `REACT_APP_API_URL` is set to your LAN IP (not `localhost`)
- Rebuild after changing: `npm run build && npx cap sync android`

### Gradle sync fails
- Open Android Studio → File → **Invalidate Caches and Restart**
- Or delete `android/.gradle` and retry

### "cleartext HTTP traffic not permitted"
This should be fixed already by `network_security_config.xml`. If issues persist:
- Check `android/app/src/main/AndroidManifest.xml` has `android:usesCleartextTraffic="true"`
- Check `android/app/src/main/res/xml/network_security_config.xml` exists

### White screen on app launch
- Run `npx cap sync android` again (build/ may be stale)
- Check Android Studio Logcat for errors (filter by "Console" or "chromium")

### App crashes on startup
- In Android Studio: **View → Tool Windows → Logcat**
- Filter by your app package: `com.vehicle.health`
- Look for stack traces

---

## Known Limitations

- **API calls require a running backend** — the app is not standalone; it needs `python api_server.py` running
- **HTTP only** — for production, use HTTPS and update `network_security_config.xml` to restrict cleartext
- **No offline mode** — all data comes from the backend in real-time
- **Splash screen** uses the default Capacitor splash; customize images in `android/app/src/main/res/drawable*/splash.png`
