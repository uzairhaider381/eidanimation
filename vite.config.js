import { defineConfig } from 'vite';

export default defineConfig({
  // Use repository name for GitHub Pages subdirectory, otherwise root for Vercel/Local
  base: process.env.GITHUB_ACTIONS ? '/eidanimation/' : '/'
});
