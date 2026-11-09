import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('@react-three') || id.includes('postprocessing')) return 'r3f'
          if (id.includes('gsap') || id.includes('lenis') || id.includes('framer-motion')) return 'motion'
        },
      },
    },
  },
})
