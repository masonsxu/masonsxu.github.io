import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function ogImage(): Plugin {
  return {
    name: 'og-image',
    apply: 'build',
    async closeBundle() {
      const { generateOg } = await import('./scripts/gen-og.mjs')
      const r = await generateOg()
      console.log(`og-image: ${r.width}x${r.height} -> dist/og-image.png (${r.fonts} fonts)`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [react(), tailwindcss(), ogImage()],
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
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          return 'vendor'
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
