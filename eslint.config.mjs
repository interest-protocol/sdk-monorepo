// eslint.config.js or eslint.config.mjs
import config from './tools/eslint-config/index.js';

export default [
  ...config,
  // This separate config object handles ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'build/**',
      'coverage/**',
      'tools/**',
      '.prettierrc.js',
      '**/dist/**',
      '**/dist',
      'packages/*/dist',
      'packages/*/dist/**',
      'packages/*/jest.config.js',
      'packages/*/rollup.config.js',
      'packages/*/check-bundle.js',
    ],
  },
];
