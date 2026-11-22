import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: {
      entry: { index: resolve(__dirname, 'src/index.ts') },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', /^@storage-persist\/core/],
      output: { exports: 'named' },
      treeshake: { moduleSideEffects: false, propertyReadSideEffects: false },
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
  },
});
