import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      include: ['src/services/**', 'src/utils/**'],
      // CI plan §4.5: 70% line coverage on business logic, raised each sprint.
      thresholds: { lines: 70 },
    },
  },
});
