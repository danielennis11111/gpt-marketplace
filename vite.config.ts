import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gpt-marketplace/', // Set the base to your GitHub repo name
  server: {
    port: 3002,
    host: true
  }
}); 