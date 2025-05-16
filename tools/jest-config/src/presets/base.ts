import type { Config } from 'jest';

export const createBaseConfig = (rootDir: string = '.'): Config => {
  return {
    rootDir,
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          tsconfig: 'tsconfig.spec.json',
        },
      ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  };
};
