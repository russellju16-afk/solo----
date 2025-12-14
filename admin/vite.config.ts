import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vitejs.dev/config/

const antdLargeComponents = new Set(['table', 'form', 'date-picker', 'select', 'upload', 'tree', 'cascader'])

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
            return 'react-vendor'
          }

          if (id.includes('/antd/')) {
            const marker = id.includes('/antd/es/') ? '/antd/es/' : id.includes('/antd/lib/') ? '/antd/lib/' : null
            if (marker) {
              const component = id.split(marker)[1]?.split('/')[0]
              if (component && antdLargeComponents.has(component)) return `antd-${component}`
            }

            return 'antd'
          }
          if (id.includes('/@ant-design/icons/')) return 'ant-design-icons'
          if (id.includes('/@ant-design/')) return 'ant-design'
          if (id.includes('/rc-')) return 'rc'

          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        // 可通过环境变量 API_PROXY_TARGET 覆盖后端地址，默认 http://localhost:3002
        target: process.env.API_PROXY_TARGET || 'http://localhost:3002',
        changeOrigin: true,
        // 移除rewrite配置，因为后端API已经包含/api前缀
      },
      '/uploads': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
