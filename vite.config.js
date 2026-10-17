import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base path so the build works in any subdirectory (GitHub Pages) or root domain (Vercel/Netlify)
  base: './',
  server: {
    port: 5173,
    host: true,
  },
});
