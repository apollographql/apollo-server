import { defaults } from 'jest-config';

export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  preset: 'ts-jest',
  testMatch: null,
  testRegex: '/__tests__/.*\\.test\\.(js|ts)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  clearMocks: true,
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: '<rootDir>/src/__tests__/tsconfig.json',
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    // Ignore '.js' at the end of imports; part of ESM support.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
