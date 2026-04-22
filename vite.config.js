import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Yahoo Finance chart API (live prices)
      '/api/yahoo/chart': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo\/chart/, '/v8/finance/chart'),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      },
      // Proxy Yahoo Finance search API (stock autocomplete)
      '/api/yahoo/search': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo\/search/, '/v1/finance/search'),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      },
    },
  },
})
