import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 80,
    host: 'localhost',
    // إعداد HMR صريح لضمان عمل التحديث التلقائي على المنفذ 80
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 80,
    },
    proxy: {
      '/api': {
      // target: 'https://tabibi.dz',
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: ['es2015', 'chrome80', 'safari13'],
  }
})