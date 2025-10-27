import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const targetCompany = process.env.VITE_TARGET_COMPANY || '_template';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@content': path.resolve(__dirname, `src/data/targets/${targetCompany}`),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['motion'],
          markdown: ['react-markdown'],
        },
      },
    },
    chunkSizeWarningLimit: 150, // KB - fail if chunks exceed 150KB
  },
  server: {
    port: 5173,
    open: true,
  },
});
