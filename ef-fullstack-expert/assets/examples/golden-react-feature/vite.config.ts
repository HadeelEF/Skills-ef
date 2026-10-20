import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Only VITE_* variables reach the bundle, and everything in the bundle is public. No secrets here.
  envPrefix: 'VITE_',
  build: {
    // Source maps are produced for the error-reporting pipeline but not referenced from the bundle;
    // upload them to the telemetry backend and do not deploy *.map files to the public web root.
    sourcemap: 'hidden',
    // Fail review, not production: a route chunk crossing this size needs a reason.
    chunkSizeWarningLimit: 500, // minified; the gzip budget for first render is enforced by scripts/check-bundle-budget.mjs
  },
  server: {
    proxy: { '/api': 'https://localhost:5001', '/bff': 'https://localhost:5001', '/hubs': { target: 'https://localhost:5001', ws: true } },
  },
});
