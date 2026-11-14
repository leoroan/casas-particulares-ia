import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: https://leoroan.github.io/casas-particulares-ia/
export default defineConfig({
  plugins: [react()],
  base: '/casas-particulares-ia/',
});