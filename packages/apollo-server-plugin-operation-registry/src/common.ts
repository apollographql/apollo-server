export const pluginName: string = require('../package.json').name;
import { createHash } from 'crypto';
import { parse } from 'graphql/language';
import {
  hideLiterals,
  printWithReducedWhitespace,
  sortAST,
} from 'apollo-engine-reporting';

const envOverrideOperationManifest = 'APOLLO_OPERATION_MANIFEST_BASE_URL';

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
