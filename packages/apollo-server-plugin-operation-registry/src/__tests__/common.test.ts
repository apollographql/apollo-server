import * as common from '../common';

describe('common', () => {
  it('uses the correct cache prefix', () => {
    expect(common.getStoreKey('abc123')).toStrictEqual('apq:abc123');
  });

  it('uses the v2 manifest prefix', () => {
    expect(
      common.getOperationManifestUrl('aServiceId', 'aSchemaHash'),
    ).toStrictEqual('v2/aServiceId/aSchemaHash');
  });
});
