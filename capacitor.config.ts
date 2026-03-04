import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vehicle.health',
  appName: 'Vehicle Health',
  webDir: 'build',
  server: {
    // Uncomment the line below ONLY during live-reload development.
    // Replace <YOUR_LOCAL_IP> with your machine's IP (e.g., 192.168.1.5)
    // url: 'http://<YOUR_LOCAL_IP>:3000',
    cleartext: true,  // required for HTTP on Android
  },
  android: {
    // Allow mixed content (HTTP) if your API server is HTTP-only
    allowMixedContent: true,
  },
};

export default config;
