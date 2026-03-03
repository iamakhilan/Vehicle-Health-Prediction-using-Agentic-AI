---
description: How to build, sync, and deploy the Vehicle Health Android APK
---

## Standard Development Workflow

1. After making frontend changes, build and sync to Android:
// turbo
```
npm run cap:sync
```

2. Open Android Studio:
```
npm run cap:android
```

## Build Debug APK (without Android Studio)

3. Run Gradle assembleDebug inside the android/ directory:
```
npm run android:debug-apk
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Live-Reload Development

4. Start the React dev server in one terminal:
```
npm start
```

5. In another terminal, run live-reload on device:
```
npm run cap:live
```

## Install APK on Device via USB

6. Enable USB Debugging on your Android phone (Settings → Developer Options → USB Debugging)

7. Install via ADB:
```
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Production / Release APK

8. Build the React app in production mode:
```
npm run build
npx cap sync android
```

9. In Android Studio: Build → Generate Signed Bundle / APK → APK → provide keystore → Release
   OR via Gradle:
```
cd android && .\gradlew assembleRelease
```
Release APK location: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
