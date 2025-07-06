import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoImport from 'unplugin-auto-import/vite'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/assets/icons/svg')],
      symbolId: 'icon-[dir]-[name]'
    }),
    autoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: process.env.VITE_PORT || 3000,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://106.14.170.191:8080',
                                              //http://106.14.170.191:8080;http://192.168.43.80:8080
        changeOrigin: true,                   //172.20.10.3
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // 如果需要使用Mock服务，可以添加以下配置
      '/api/email': {
        target: 'http://127.0.0.1:4523',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/email/, '/m1/6686103-6395409-default/email/1')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})
