import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cover-up-catalogo/' // ← el nombre exacto de tu repo
})