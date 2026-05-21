import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.DEPLOY_TARGET === 'ghpages' ? '/portpolio/' : '/',
  build: {
    outDir: process.env.DEPLOY_TARGET === 'ghpages' ? 'dist-gh' : 'dist',
  },
})
