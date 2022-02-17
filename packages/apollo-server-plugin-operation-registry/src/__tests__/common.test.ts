import * as common from '../common';

describe('common', () => {
  it('uses the correct cache prefix', () => {
    expect(common.getStoreKey('abc123')).toStrictEqual('abc123');
  });

  describe('urlOperationManifestBase', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('evaluates to the override url when overridden', () => {
      process.env.APOLLO_OPERATION_MANIFEST_BASE_URL = 'override';
      const { urlOperationManifestBase } = require('../common');
      expect(urlOperationManifestBase).toStrictEqual('override');
    });

    it('removes trailing slashes from the override url when overridden', () => {
      process.env.APOLLO_OPERATION_MANIFEST_BASE_URL = 'override/';
      const { urlOperationManifestBase } = require('../common');
      expect(urlOperationManifestBase).toStrictEqual('override');
    });

    it('evaluates to the test url when testing', () => {
      process.env.__APOLLO_OPERATION_REGISTRY_TESTS__ = 'true';
      const {
        urlOperationManifestBase,
        fakeTestBaseUrl,
      } = require('../common');
      expect(urlOperationManifestBase).toStrictEqual(fakeTestBaseUrl);
    });

    it('evaluates to the default value when not overridden or testing', () => {
      process.env.__APOLLO_OPERATION_REGISTRY_TESTS__ = 'false';
      const { urlOperationManifestBase } = require('../common');
      expect(urlOperationManifestBase).toStrictEqual(
        'https://operations.api.apollographql.com',
      );
    });
  });

  describe('urlStorageSecretBase', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('evaluates to the override url when overridden', () => {
      process.env.APOLLO_STORAGE_SECRET_BASE_URL = 'override';
      const { urlStorageSecretBase } = require('../common');
      expect(urlStorageSecretBase).toStrictEqual('override');
    });

    it('removes trailing slashes from the override url when overridden', () => {
      process.env.APOLLO_STORAGE_SECRET_BASE_URL = 'override/';
      const { urlStorageSecretBase } = require('../common');
      expect(urlStorageSecretBase).toStrictEqual('override');
    });

    it('evaluates to the test url when testing', () => {
      process.env.__APOLLO_OPERATION_REGISTRY_TESTS__ = 'true';
      const { urlStorageSecretBase, fakeTestBaseUrl } = require('../common');
      expect(urlStorageSecretBase).toStrictEqual(fakeTestBaseUrl);
    });

    it('evaluates to the default value when not overridden or testing', () => {
      process.env.__APOLLO_OPERATION_REGISTRY_TESTS__ = 'false';
      const { urlStorageSecretBase } = require('../common');
      expect(urlStorageSecretBase).toStrictEqual(
        'https://storage-secrets.api.apollographql.com',
      );
    });
  });
});
