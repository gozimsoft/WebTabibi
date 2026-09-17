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
      port: 81,
      host: 'localhost',
      watch: {
        ignored: ['**/android/**', '**/ios/**'],
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    optimizeDeps: {
      entries: ['index.html', 'src/**/*.{js,jsx}'],
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: ['es2015', 'chrome80', 'safari13'],
    }
  }
})
