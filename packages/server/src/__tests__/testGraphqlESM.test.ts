import { describe, it, expect } from '@jest/globals';
import { version } from 'graphql17';

describe('canary ESM graphql v17-alpha', () => {
  it('should work', () => {
    expect(version).toBe('17.0.0-alpha.9'); // this version is the latest alpha on which the canary is based
  });
});
