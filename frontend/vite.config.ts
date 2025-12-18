import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/problems': 'http://127.0.0.1:8000',
      '/fetch': 'http://127.0.0.1:8000',
      '/check': 'http://127.0.0.1:8000'
    }
  }
})
