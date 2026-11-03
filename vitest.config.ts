import { configDefaults, defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
    // Spec Playwright (__tests__/e2e) dijalankan oleh `bun run test:e2e`, bukan Vitest —
    // kalau ikut terbaca, worker Vitest gagal start dan `test:api` exit 1.
    exclude: [...configDefaults.exclude, '__tests__/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
