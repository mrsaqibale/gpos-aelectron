import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  build: {
    outDir: 'renderer',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true
  }
})
