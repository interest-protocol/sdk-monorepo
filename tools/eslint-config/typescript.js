// TypeScript ESLint configuration
import tseslint from 'typescript-eslint';
import baseConfig from './base.js'; // Import directly from base.js

export default [
  ...baseConfig, // Spread the base config
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],

      // Disable rules that TypeScript handles
      'no-undef': 'off',
    },
  },
];
