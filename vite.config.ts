import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import vitePluginSitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginSitemap({
      hostname: 'https://masonsxu-github-io.pages.dev/',
      exclude: ['/404'],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          remotion: ['remotion', '@remotion/player'],
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
})