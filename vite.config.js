import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
        liderazgoResults: resolve(__dirname, 'liderazgo-results.html')
      }
    }
  }
})
