export const pluginName: string = require('../package.json').name;

const envOverrideOperationManifest = 'APOLLO_OPERATION_MANIFEST_BASE_URL';

// Generate and cache our desired operation manifest URL.
const urlOperationManifestBase: string = ((): string => {
  const desiredUrl =
    process.env[envOverrideOperationManifest] ||
    'https://storage.googleapis.com/engine-op-manifest-storage-prod/';

  // Make sure it has NO trailing slash.
  return desiredUrl.replace(/\/$/, '');
})();

export function getOperationManifestUrl(
  hashedServiceId: string,
  schemaHash: string,
): string {
  return [urlOperationManifestBase, hashedServiceId, schemaHash].join('/');
}
