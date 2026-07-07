import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// base: set to '/<repo-name>/' if deploying to https://<user>.github.io/<repo>/
// With a custom domain (kdamora.com) or <user>.github.io root repo, keep '/'.
//
// npm run dev:https → self-signed HTTPS on the LAN, needed because Web Crypto
// (story-mode decryption) only runs in secure contexts. Plain `npm run dev`
// stays http on localhost, which is already a secure context.
export default defineConfig({
  base: '/0nl1n3-pr353nc3/',
  plugins: process.env.DEV_HTTPS ? [basicSsl()] : [],
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
});
