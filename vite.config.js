import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://www.cse.lk',
        changeOrigin: true,
        secure: false,
        headers: {
          'Referer': 'https://www.cse.lk/equity/trade-summary',
          'Origin': 'https://www.cse.lk',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      },
      '/tv-api': {
        target: 'https://scanner.tradingview.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tv-api/, ''),
        headers: {
          'Origin': 'https://www.tradingview.com',
          'Referer': 'https://www.tradingview.com/screener/',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      }
    }
  }
})
