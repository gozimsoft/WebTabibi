import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/web/',
  plugins: [react()],
  server: {
    port: 82,
    proxy: {
      // Forward /api/* to PHP backend during dev
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
