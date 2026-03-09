import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e/**', '**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/app/**',
        'src/lib/prisma.ts',
        'src/middlewares/**',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
