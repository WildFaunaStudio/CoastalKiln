import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Coastal Kiln',
        short_name: 'CoastalKiln',
        description: 'Pottery tracking and community app',
        theme_color: '#d4a574',
        background_color: '#f5f1e8',
        display: 'standalone',
        icons: [
  {
    src: 'icons/icon-192x192.png',  // Changed path
    sizes: '192x192',
    type: 'image/png'
  },
  {
    src: 'icons/icon-512x512.png',  // Changed path
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any maskable'
  }
]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
      }
    })
  ],
  server: {
    port: 3000,
  },
});
