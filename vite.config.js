import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// VitePWA disabled for debugging
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // VitePWA disabled - uncomment to re-enable
  ],
  server: {
    port: 3000,
  },
});
