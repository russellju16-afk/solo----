import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // 可通过环境变量 API_PROXY_TARGET 覆盖后端地址，默认 http://localhost:3002
        target: process.env.API_PROXY_TARGET || 'http://localhost:3002',
        changeOrigin: true,
        // 移除rewrite配置，因为后端API已经包含/api前缀
      },
    },
  },
})
