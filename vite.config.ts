import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CmdkWc',
      formats: ['es', 'umd'],
      fileName: (format) => `cmdk-wc.${format}.js`,
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      external: ['lit', '@lit-labs/signals'],
      output: {
        globals: {
          lit: 'Lit',
          '@lit-labs/signals': 'LitSignals',
        },
      },
    },
  },
});
