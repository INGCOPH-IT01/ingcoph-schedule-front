import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [vue(), basicSsl()],
  server: {
    port: 3000,
    https: true,
    host: true,
    proxy: {
      '/api': {
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'vuetify': ['vuetify'],
          'utilities': ['axios', 'laravel-echo', 'pusher-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
