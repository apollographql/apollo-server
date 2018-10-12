import * as common from '../common';

describe('common', () => {
  it('uses the correct cache prefix', () => {
    expect(common.getCacheKey('abc123')).toStrictEqual('apq:abc123');
  });
});
