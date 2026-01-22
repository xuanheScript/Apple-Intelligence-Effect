import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 开发时直接使用源文件，无需每次 build
      'apple-intelligence-lock-screen': path.resolve(__dirname, '../src/index.ts'),
    },
  },
})
