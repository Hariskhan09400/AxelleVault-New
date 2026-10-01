import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[/\\]node_modules[/\\](react|react-dom|react-router-dom)[/\\]/.test(id)) {
            return 'vendor-react';
          }
          if (/[/\\]node_modules[/\\]@supabase[/\\]/.test(id)) {
            return 'vendor-supabase';
          }
          if (/[/\\]node_modules[/\\](lucide-react|framer-motion)[/\\]/.test(id)) {
            return 'vendor-ui';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
