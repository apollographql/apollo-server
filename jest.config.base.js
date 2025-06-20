import { defaults } from 'jest-config';
import { createRequire } from 'node:module';

export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  testMatch: null,
  testRegex: '/__tests__/.*\\.test\\.(js|ts)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  clearMocks: true,
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    // Ignore '.js' at the end of imports; part of ESM support.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
