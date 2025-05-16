import type { Config } from 'jest';
import { createBaseConfig } from './base';

export const createNodeConfig = (rootDir?: string): Config => ({
  ...createBaseConfig(rootDir),
  testEnvironment: 'node',
});
