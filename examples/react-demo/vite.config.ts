import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const packages = resolve(__dirname, '../../packages');

// Point at the package sources so the demo works without building first
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@storage-persist/core/middleware',
        replacement: `${packages}/core/src/middleware/index.ts`,
      },
      { find: '@storage-persist/core', replacement: `${packages}/core/src/index.ts` },
      { find: '@storage-persist/react', replacement: `${packages}/react/src/index.ts` },
    ],
  },
});
