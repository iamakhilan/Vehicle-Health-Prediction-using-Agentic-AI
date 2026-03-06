import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vehicle.health',
  appName: 'Vehicle Health',
  webDir: 'build',
  server: {
    // Uncomment the line below ONLY during live-reload development.
    // Replace <YOUR_LAN_IP> with your machine's IP (e.g., 192.168.1.5)
    // url: 'http://<YOUR_LAN_IP>:3000',
    cleartext: true,  // required for HTTP API calls on Android
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,  // Allow HTTP if your API server is HTTP-only
    backgroundColor: '#F2F0ED', // secondary-sand
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      backgroundColor: '#F2F0ED',
    },
  },
};

export default config;
