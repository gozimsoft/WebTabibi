import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // قراءة المتغيرات البيئية من ملف .env لتوجيه خادم التطوير
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'https://tabibi.dz'

  return {
    base: './',
    plugins: [react()],
    assetsInclude: ['**/*.md'],
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
    preview: {
      port: 4173,
      host: 'localhost',
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('purify')) {
                return 'vendor-pdf';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('i18next')) {
                return 'vendor-i18n';
              }
              if (id.includes('react') || id.includes('scheduler')) {
                return 'vendor-react';
              }
            }
          }
        }
      }
    }
  }
})
