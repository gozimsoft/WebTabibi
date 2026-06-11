import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // قراءة المتغيرات البيئية من ملف .env لتوجيه خادم التطوير
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'https://tabibi.dz'

  return {
    base: './',
    plugins: [react()],
    server: {
      port: 80,
      host: 'localhost',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: ['es2015', 'chrome80', 'safari13'],
    }
  }
})
