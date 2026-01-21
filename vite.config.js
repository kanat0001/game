import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://194.87.131.44:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
