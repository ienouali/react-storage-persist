import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        middleware: resolve(__dirname, 'src/middleware/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      output: { exports: 'named' },
      treeshake: { moduleSideEffects: false, propertyReadSideEffects: false },
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
  },
});
