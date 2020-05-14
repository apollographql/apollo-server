import * as common from '../common';

describe('common', () => {
  it('uses the correct cache prefix', () => {
    expect(common.getStoreKey('abc123')).toStrictEqual('abc123');
  });

  it('uses the v2 manifest suffix', () => {
    expect(
      common.getLegacyOperationManifestUrl('aServiceId', 'aSchemaHash'),
    ).toMatchInlineSnapshot(
      `"https://fake-host-for-apollo-op-reg-tests/aServiceId/aSchemaHash.v2.json"`,
    );
  });
});
