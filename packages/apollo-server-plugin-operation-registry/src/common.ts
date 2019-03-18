export const pluginName: string = require('../package.json').name;
import { createHash } from 'crypto';

export const envOverrideOperationManifest =
  'APOLLO_OPERATION_MANIFEST_BASE_URL';

// Generate and cache our desired operation manifest URL.
const urlOperationManifestBase: string = ((): string => {
  const desiredUrl =
    process.env[envOverrideOperationManifest] ||
    'https://storage.googleapis.com/engine-op-manifest-storage-prod/';

  // Make sure it has NO trailing slash.
  return desiredUrl.replace(/\/$/, '');
})();

export const getStoreKey = (signature: string) => `${signature}`;

export function generateServiceIdHash(serviceId: string): string {
  return createHash('sha512')
    .update(serviceId)
    .digest('hex');
}

export function getOperationManifestUrl(
  hashedServiceId: string,
  schemaHash: string,
): string {
  return (
    [urlOperationManifestBase, hashedServiceId, schemaHash].join('/') +
    '.v2.json'
  );
}

export function hashForLogging(hash: string): string {
  if (typeof hash !== 'string') {
    return '<non-string>';
  }
  return hash.substring(0, 8);
}
