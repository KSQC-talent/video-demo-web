import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
    resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 80,
    // ✅ 配置VITE代理，解决axios跨域问题
    proxy: {
      // 配置代理标识：所有以 /api 开头的请求，都会被代理到后端地址
      '/api': {
        target: 'http://localhost:8080', // 你的SpringBoot后端真实地址+端口
        changeOrigin: true, // 开启跨域代理（必须为true，核心开关）
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径：去掉请求地址里的/api前缀
      }
    }
  }
})