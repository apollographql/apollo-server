export const pluginName: string = require('../package.json').name;
import { createHash } from 'crypto';

export const envOverrideOperationManifest =
  'APOLLO_OPERATION_MANIFEST_BASE_URL';

export const envOverrideStorageSecretBaseUrl = 'APOLLO_STORAGE_SECRET_BASE_URL';

export const fakeTestBaseUrl = 'https://fake-host-for-apollo-op-reg-tests/';

// Generate and cache our desired operation manifest URL.
export const urlOperationManifestBase: string = ((): string => {
  const desiredUrl =
    process.env[envOverrideOperationManifest] ||
    // See src/__tests__/jestSetup.ts for more details on this env. variable.
    process.env['__APOLLO_OPERATION_REGISTRY_TESTS__'] === 'true'
      ? fakeTestBaseUrl
      : 'https://storage.googleapis.com/engine-op-manifest-storage-prod/';

  // Make sure it has NO trailing slash.
  return desiredUrl.replace(/\/$/, '');
})();

// Generate and cache our desired storage secret URL.
export const urlStorageSecretBase: string = ((): string => {
  const desiredUrl =
    process.env[envOverrideStorageSecretBaseUrl] ||
    // See src/__tests__/jestSetup.ts for more details on this env. variable.
    process.env['__APOLLO_OPERATION_REGISTRY_TESTS__'] === 'true'
      ? fakeTestBaseUrl
      : 'https://storage.googleapis.com/engine-partial-schema-prod/';

  // Make sure it has NO trailing slash.
  return desiredUrl.replace(/\/$/, '');
})();

export const getStoreKey = (signature: string) => `${signature}`;

export function generateServiceIdHash(serviceId: string): string {
  return createHash('sha512')
    .update(serviceId)
    .digest('hex');
}

export function getStorageSecretUrl(
  graphId: string,
  apiKeyHash: string,
): string {
  return `${urlStorageSecretBase}/${graphId}/storage-secret/${apiKeyHash}.json`;
}

export function getOperationManifestUrl(
  graphId: string,
  storageSecret: string,
  graphVariant: string = 'current',
): string {
  return `${urlOperationManifestBase}/${graphId}/${storageSecret}/${graphVariant}/manifest.v2.json`;
}

export function getLegacyOperationManifestUrl(
  hashedGraphId: string,
  schemaHash: string,
): string {
  return (
    [urlOperationManifestBase, hashedGraphId, schemaHash].join('/') + '.v2.json'
  );
}

export function signatureForLogging(signature: string): string {
  if (typeof signature !== 'string') {
    return '<non-string>';
  }
  return signature.substring(0, 8);
}
