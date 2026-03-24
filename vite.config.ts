import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import vitePluginSitemap from 'vite-plugin-sitemap'

function removeLazyChunkPreload(): Plugin {
  return {
    name: 'remove-lazy-chunk-preload',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="modulepreload"[^>]*(?:remotion|framer-motion|three)[^>]*>\n?\s*/g,
        '',
      )
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginSitemap({
      hostname: 'https://masonsxu-github-io.pages.dev/',
      exclude: ['/404'],
    }),
    removeLazyChunkPreload(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          remotion: ['remotion', '@remotion/player', '@remotion/transitions'],
          'framer-motion': ['framer-motion'],
          three: ['three'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
