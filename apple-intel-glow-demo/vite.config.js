import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署时使用仓库名作为 base 路径
  base: process.env.GITHUB_ACTIONS ? '/Apple-Intelligence-Effect/' : '/',
  resolve: {
    alias: {
      // 开发时直接使用源文件，无需每次 build
      'apple-intelligence-glow-react': path.resolve(__dirname, '../src/index.ts'),
    },
  },
})
