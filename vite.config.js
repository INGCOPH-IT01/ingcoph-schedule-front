import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue(), basicSsl()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development')
    },
    server: {
      https: true,
      port: 5555,
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
  }
})
