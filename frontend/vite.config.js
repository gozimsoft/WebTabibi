import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 80,
    proxy: {
      '/api': {
        target: 'https://tabibi.dz',
      // target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: ['es2015', 'chrome80', 'safari13'],
  }
})