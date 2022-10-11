import { operationDerivedDataCacheKey } from '../../../plugin/usageReporting/operationDerivedDataCache';
import { describe, it, expect } from '@jest/globals';

describe('operation-derived data cache key', () => {
  it('generates without the operationName', () => {
    expect(operationDerivedDataCacheKey('abc123', '')).toEqual('abc123');
  });

  it('generates with the operationName', () => {
    expect(operationDerivedDataCacheKey('abc123', 'myOperation')).toEqual(
      'abc123:myOperation',
    );
  });
});
