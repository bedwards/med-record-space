import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'dist/',
        '.husky/'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    setupFiles: ['./tests/setup.js']
  }
});
