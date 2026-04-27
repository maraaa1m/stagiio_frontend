import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // ADDED THIS
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ADDED THIS TO RESTORE STYLING
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Clean path logic
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});