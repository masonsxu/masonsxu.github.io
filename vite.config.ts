import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 启用 Rolldown（Vite 8+ 默认打包器）的代码分割
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React 生态
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          // Remotion 重型库
          if (id.includes('node_modules/@remotion') || id.includes('node_modules/remotion')) {
            return 'remotion-vendor'
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor'
          }
          // 其他 npm 包
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    // 提高 chunk 大小警告阈值（优化后应该不再触发）
    chunkSizeWarningLimit: 300,
  },
})
