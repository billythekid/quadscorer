import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: 'static',
    build: {
        outDir: 'public',
        emptyOutDir: true,
    },
});
