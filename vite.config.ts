import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            include: ['src/**/*'],
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*'],
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                core: resolve(__dirname, 'src/core/index.ts'),
                react: resolve(__dirname, 'src/react/index.ts'),
                middleware: resolve(__dirname, 'src/middleware/index.ts'),
            },
            name: 'ReactStoragePersist',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                const ext = format === 'es' ? 'mjs' : 'cjs';
                return `${entryName}.${ext}`;
            },
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
                exports: 'named',
                preserveModules: false,
            },
        },
        sourcemap: true,
        minify: 'esbuild',
        target: 'es2020',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});