import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site at https://<user>.github.io/builder-bee-calendar/
export default defineConfig({
  base: '/builder-bee-calendar/',
  plugins: [react()],
});
