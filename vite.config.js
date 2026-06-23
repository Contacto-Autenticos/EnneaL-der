import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'pwa-icons/icon-192x192.png', 'pwa-icons/icon-512x512.png'],
      manifest: {
        name: 'Auténticos',
        short_name: 'Auténticos',
        description: 'Auténticos - Tu test de Eneagrama y Liderazgo',
        theme_color: '#0f2234',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        agenda: resolve(__dirname, 'agenda.html'),
        dominios: resolve(__dirname, 'dominios.html'),
        eneagrama: resolve(__dirname, 'eneagrama.html'),
        escaneo: resolve(__dirname, 'escaneo-empresarial.html'),
        diagnostico: resolve(__dirname, 'diagnostico-empresarial.html'),
        liderazgoIntro: resolve(__dirname, 'liderazgo-test-intro.html'),
        liderazgoTest: resolve(__dirname, 'liderazgo-test.html'),
        liderazgoResults: resolve(__dirname, 'liderazgo-results.html'),
        hazQueSuceda: resolve(__dirname, 'haz-que-suceda.html'),
        mltLanding: resolve(__dirname, 'mlt-landing.html')
      },
      output: {
        manualChunks: {
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-charts': ['recharts'],
          'vendor-animations': ['gsap'],
          'vendor-icons': ['lucide-react'],
          'vendor-react-core': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
