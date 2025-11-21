import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, readFileSync } from 'fs'
import { fileURLToPath, URL } from 'node:url'

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
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
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
          'utilities': ['axios', 'laravel-echo', 'pusher-js'],
          // Split large libraries into separate chunks for better caching
          'excel': ['exceljs'],
          'qr-codes': ['qrcode', 'vue-qr', 'vue-qrcode-reader'],
          'sweetalert': ['sweetalert2']
        },
        // Ensure unique hashes for each build
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    },
    chunkSizeWarningLimit: 1000,
    // Inline small assets (< 4kb) as base64
    assetsInlineLimit: 4096,
    // Split CSS for better caching
    cssCodeSplit: true,
    // Disable source maps in production for smaller bundle
    sourcemap: false,
    // Minification with console removal
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  },
  // Remove console logs in production
  esbuild: {
    drop: import.meta.env?.MODE === 'production' ? ['console', 'debugger'] : []
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.buildVersion ?? null),
    __APP_BUILD_DATE__: JSON.stringify(pkg.buildDate ?? null)
  }
})
