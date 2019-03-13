import * as common from '../common';

describe('common', () => {
  it('uses the correct cache prefix', () => {
    expect(common.getStoreKey('abc123')).toStrictEqual('apq:abc123');
  });

  it('uses the v2 manifest suffix', () => {
    expect(
      common.getOperationManifestUrl('aServiceId', 'aSchemaHash'),
    ).toStrictEqual('aServiceId/aSchemaHash.v2.json');
  });
});
