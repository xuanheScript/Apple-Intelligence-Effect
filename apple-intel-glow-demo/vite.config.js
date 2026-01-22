import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isCI = process.env.GITHUB_ACTIONS || process.env.CI
// 从 GitHub Actions 环境变量获取仓库信息，格式: owner/repo
const githubRepo = process.env.GITHUB_REPOSITORY || 'xuanheScript/Apple-Intelligence-Effect'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署时使用仓库名作为 base 路径
  base: isCI ? '/Apple-Intelligence-Effect/' : '/',
  define: {
    // 注入仓库地址到代码中
    __GITHUB_REPO__: JSON.stringify(githubRepo),
  },
  resolve: {
    alias: isCI
      ? {
          // CI 环境使用构建后的包，避免 React 多实例问题
          'apple-intelligence-glow-react': path.resolve(__dirname, '../dist/index.mjs'),
        }
      : {
          // 开发时直接使用源文件，无需每次 build
          'apple-intelligence-glow-react': path.resolve(__dirname, '../src/index.ts'),
        },
  },
  // 确保 React 只有一个实例
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
