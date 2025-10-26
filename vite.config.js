import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { copyFileSync, readFileSync } from 'fs'

// Plugin to copy .htaccess after build
const copyHtaccess = () => ({
  name: 'copy-htaccess',
  closeBundle() {
    try {
      copyFileSync('.htaccess', 'dist/.htaccess')
      console.log('✅ .htaccess copied to dist/')
    } catch (error) {
      console.warn('⚠️  Could not copy .htaccess:', error.message)
    }
  }
})

// Read build metadata stamped by build-with-version.js
let pkg = {}
try {
  pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
} catch (e) {
  pkg = {}
}

export default defineConfig({
  plugins: [vue(), copyHtaccess()],
  server: {
    port: 3000,
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
        },
        // Ensure unique hashes for each build
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    },
    chunkSizeWarningLimit: 1000,
    // Generate new hashes on every build
    assetsInlineLimit: 0
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.buildVersion ?? null),
    __APP_BUILD_DATE__: JSON.stringify(pkg.buildDate ?? null)
  }
})
