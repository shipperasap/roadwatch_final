import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // In dev (npm run dev) base is '/', in production build base is the GitHub Pages path
  base: command === 'build' ? '/delhi-roadwatch/' : '/',
  server: {
    proxy: {
      '/api/sightengine': {
        target: 'https://api.sightengine.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sightengine/, '')
      },
      '/api/roboflow': {
        target: 'https://serverless.roboflow.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roboflow/, '')
      }
    }
  }
}))
