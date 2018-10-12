export const pluginName: string = require('../package.json').name;
import { createHash } from 'crypto';
import { parse } from 'graphql/language';
import {
  hideLiterals,
  printWithReducedWhitespace,
  sortAST,
} from 'apollo-engine-reporting';

export const envOverrideOperationManifest =
  'APOLLO_OPERATION_MANIFEST_BASE_URL';

// XXX This function is not currently invoked when the hashed APQ value
// (`extensions.persistedQuery.sha256Hash`) is set, but would
// be called if we're provided a (string) `query` (so when APQ is a miss,
// or not enabled at all).
//
// Since the `hideLiterals` and `sortAST` methods both require a
// `DocumentNode`, we'll have to call a `parse` here on the `query` string
// and make the necessary transformations.
//
// Lastly, we will remove the `hideLiterals` portion of this once the
// `apollo` CLI properly warns about including/using string literals.
function formatOperationForHashing(operation: string): string {
  return printWithReducedWhitespace(
    sortAST(hideLiterals(parse(operation))),
  ).trim();
}

// Generate and cache our desired operation manifest URL.
const urlOperationManifestBase: string = ((): string => {
  const desiredUrl =
    process.env[envOverrideOperationManifest] ||
    'https://storage.googleapis.com/engine-op-manifest-storage-prod/';

  // Make sure it has NO trailing slash.
  return desiredUrl.replace(/\/$/, '');
})();

export const getCacheKey = (signature: string) => `apq:${signature}`;

export function generateServiceIdHash(serviceId: string): string {
  return createHash('sha512')
    .update(serviceId)
    .digest('hex');
}

export function generateOperationHash(operationString: string): string {
  return createHash('sha256')
    .update(formatOperationForHashing(operationString))
    .digest('hex');
}

export function getOperationManifestUrl(
  hashedServiceId: string,
  schemaHash: string,
): string {
  return [urlOperationManifestBase, hashedServiceId, schemaHash].join('/');
}
