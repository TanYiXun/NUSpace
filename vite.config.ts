import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createLtaPublicBusArrivalsMiddleware } from './server/transit/ltaPublicBusMiddleware';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'nuspace-lta-public-bus-dev-endpoint',
      configureServer(server) {
        server.middlewares.use(createLtaPublicBusArrivalsMiddleware());
      },
    },
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    setupFiles: './src/test/setup.ts',
  },
});
