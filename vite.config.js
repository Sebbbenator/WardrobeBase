import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/replicate': {
        target: 'https://api.replicate.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/replicate/, ''),
      },
    },
  },
});
