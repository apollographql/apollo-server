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
  transform: {
    '^.+\\.test.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/src/__tests__/tsconfig.json',
        diagnostics: true,
      },
    ],
  },
  moduleNameMapper: {
    // Ignore '.js' at the end of imports; part of ESM support.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // this can be removed with jest v29
  snapshotFormat: { escapeString: false, printBasicPrototype: false },
};
