import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rehan.hvacmastertoolkit',
  appName: 'HVAC Hub',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      appId: 'com.rehan.hvacmastertoolkit',
      version: '0.0.0',
      autoUpdate: 'always',
      autoSplashscreen: true
    },
    SplashScreen: {
      launchAutoHide: false
    }
  }
};

export default config;
