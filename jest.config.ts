import type { Config } from 'jest';

const config: Config = {
  projects: [
    '<rootDir>/packages/*/jest.config.ts',
    '<rootDir>/tools/*/jest.config.ts',
  ],
  // Exclude the jest-config package itself
  testPathIgnorePatterns: ['/node_modules/', '/tools/jest-config/'],
};

export default config;
