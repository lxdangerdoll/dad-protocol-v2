import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/dad-protocol-v2/', 
  plugins: [
    react(),
    tailwindcss(),
  ],
})
