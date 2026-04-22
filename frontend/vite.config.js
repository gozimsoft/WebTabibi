import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',   // ✅ corrigé pour Capacitor
  plugins: [react()],
  server: {
    port: 82,
    proxy: {
      '/api': {
        target: 'https://tabibi.dz',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})