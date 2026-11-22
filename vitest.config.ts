import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    testTimeout: 15000,
    hookTimeout: 15000,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/*/tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/index.ts', '**/dist/**'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    // forks with a bigger heap, react hook tests can run out of memory otherwise
    pool: 'forks',
    poolOptions: {
      forks: {
        execArgv: ['--max-old-space-size=4096'],
      },
    },
  },
  resolve: {
    alias: [
      {
        find: '@storage-persist/core/middleware',
        replacement: resolve(__dirname, 'packages/core/src/middleware/index.ts'),
      },
      { find: '@storage-persist/core', replacement: resolve(__dirname, 'packages/core/src/index.ts') },
      { find: '@storage-persist/react', replacement: resolve(__dirname, 'packages/react/src/index.ts') },
    ],
  },
});
