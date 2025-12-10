import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    // Increase timeout for property-based tests (they run many iterations)
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'prisma/',
        '**/*.config.ts',
        '**/*.d.ts',
        'test/utils/**', // Exclude test utilities from coverage
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add alias for test utilities
      '@test': path.resolve(__dirname, './test'),
    },
  },
});
