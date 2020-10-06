export const pluginName: string = require('../package.json').name;

export const envOverrideOperationManifest =
  'APOLLO_OPERATION_MANIFEST_BASE_URL';

export const envOverrideStorageSecretBaseUrl = 'APOLLO_STORAGE_SECRET_BASE_URL';

export const fakeTestBaseUrl = 'https://fake-host-for-apollo-op-reg-tests';

// Generate and cache our desired operation manifest URL.
export const urlOperationManifestBase: string =
  // Remove trailing slash if any.
  process.env[envOverrideOperationManifest]?.replace(/\/$/, '') ||
  // See src/__tests__/jestSetup.ts for more details on this env. variable.
  process.env['__APOLLO_OPERATION_REGISTRY_TESTS__'] === 'true'
    ? fakeTestBaseUrl
    : 'https://operations.api.apollographql.com';

// Generate and cache our desired storage secret URL.
export const urlStorageSecretBase: string =
  // Remove trailing slash if any.
  process.env[envOverrideStorageSecretBaseUrl]?.replace(/\/$/, '') ||
  // See src/__tests__/jestSetup.ts for more details on this env. variable.
  process.env['__APOLLO_OPERATION_REGISTRY_TESTS__'] === 'true'
    ? fakeTestBaseUrl
    : 'https://storage-secrets.api.apollographql.com';

export const getStoreKey = (signature: string) => `${signature}`;

export function getStorageSecretUrl(
  graphId: string,
  apiKeyHash: string,
): string {
  return `${urlStorageSecretBase}/${graphId}/storage-secret/${apiKeyHash}.json`;
}

export function getOperationManifestUrl(
  graphId: string,
  storageSecret: string,
  graphVariant: string,
): string {
  return `${urlOperationManifestBase}/${graphId}/${storageSecret}/${graphVariant}/manifest.v2.json`;
}

export function signatureForLogging(signature: string): string {
  if (typeof signature !== 'string') {
    return '<non-string>';
  }
  return signature.substring(0, 8);
}
