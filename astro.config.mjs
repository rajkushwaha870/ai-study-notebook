// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  server: {
    port: 4321,
    allowedHosts: true
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});