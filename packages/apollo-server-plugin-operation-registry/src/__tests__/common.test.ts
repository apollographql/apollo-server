import * as common from '../common';

describe('common', () => {
  it('uses the correct cache prefix', () => {
    expect(common.getStoreKey('abc123')).toStrictEqual('abc123');
  });
});
