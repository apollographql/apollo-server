import { expect } from '@jest/globals';
import nock from 'nock';

// Ensures an active and clean nock before every test
export function nockBeforeEach() {
  if (!nock.isActive()) {
    nock.activate();
  }
  // Cleaning _before_ each test ensures that any mocks from a previous test
  // which failed don't affect the current test.
  nock.cleanAll();
}

// Ensures a test is complete (all expected requests were run) and a clean
// global state after each test.
export function nockAfterEach() {
  // un-mock HTTP interceptor
  nock.restore();
  // effectively nock.isDone() but with more helpful messages in test failures
  expect(nock.activeMocks()).toEqual([]);
}
