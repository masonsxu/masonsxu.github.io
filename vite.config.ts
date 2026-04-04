import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import vitePluginSitemap from 'vite-plugin-sitemap'

function removeLazyChunkPreload(): Plugin {
  return {
    name: 'remove-lazy-chunk-preload',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="modulepreload"[^>]*(?:remotion|framer-motion|three|ThreeBackground|WebGPUBackground|webgpu)[^>]*>\n?\s*/g,
        '',
      )
    },
  }
}

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    tailwindcss(),
    vitePluginSitemap({
      hostname: 'https://masonsxu-github-io.pages.dev/',
      exclude: ['/404'],
    }),
    removeLazyChunkPreload(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 850,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('node_modules/remotion') || id.includes('node_modules/@remotion/')) return 'remotion'
          if (id.includes('node_modules/framer-motion')) return 'framer-motion'
          if (id.includes('node_modules/lucide-react')) return 'icons'
          if (id.includes('src/webgpu/') || id.includes('WebGPUBackground')) return 'webgpu'
        },
      },
    },
  },
})
