import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
      },
      include: ['src/engine/**'],
    },
  },
});
