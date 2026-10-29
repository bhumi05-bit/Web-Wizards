import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'zustand'],
          'vendor-markdown': [
            'react-markdown',
            'remark-gfm',
            'rehype-highlight',
            'rehype-raw',
            'rehype-sanitize',
            'rehype-slug',
            'dompurify'
          ]
        }
      }
    }
  }
});
