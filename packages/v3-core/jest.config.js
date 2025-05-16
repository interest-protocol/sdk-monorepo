/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
<<<<<<< HEAD
        tsconfig: '<rootDir>/tsconfig.json',
=======
        tsconfig: '<rootDir>/tsconfig.spec.json',
>>>>>>> main
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.test.ts'],
};

module.exports = config;
