export const pluginName: string = require('../package.json').name;
import { createHash } from 'crypto';
import { visit } from 'graphql/language/visitor';
import {
  DocumentNode,
  IntValueNode,
  FloatValueNode,
  StringValueNode,
} from 'graphql/language/ast';
import {
  printWithReducedWhitespace,
  sortAST,
} from 'apollo-graphql/lib/transforms';

export const envOverrideOperationManifest =
  'APOLLO_OPERATION_MANIFEST_BASE_URL';

// DUPLICATED FROM https://github.com/apollographql/apollo-tooling/blob/d7429b80/packages/apollo/src/commands/client/push.ts#L29-L48
// In the same spirit as the similarly named `hideLiterals` function from the
// `apollo-engine-reporting/src/signature.ts` module, we'll do an AST visit
// to redact literals.  Developers are strongly encouraged to use the
// `variables` aspect of the which would avoid these being explicitly
// present in the operation manifest at all.  The primary area of concern here
// is to avoid sending in-lined literals which might contain sensitive
// information (e.g. API keys, etc.).
export function hideCertainLiterals(ast: DocumentNode): DocumentNode {
  return visit(ast, {
    IntValue(node: IntValueNode): IntValueNode {
      return { ...node, value: '0' };
    },
    FloatValue(node: FloatValueNode): FloatValueNode {
      return { ...node, value: '0' };
    },
    StringValue(node: StringValueNode): StringValueNode {
      return { ...node, value: '', block: false };
    },
  });
}

// XXX This function is not currently invoked when the hashed APQ value
// (`extensions.persistedQuery.sha256Hash`) is set, but would
// be called if we're provided a (string) `query` (so when APQ is a miss,
// or not enabled at all).
//
// Since the `hideCertainLiterals` and `sortAST` methods both require a
// `DocumentNode`, we'll have to call a `parse` here on the `query` string
// and make the necessary transformations.
//
// Lastly, we will remove the `hideCertainLiterals` portion of this once the
// `apollo` CLI properly warns about including/using string literals.
function formatDocumentForHashing(document: DocumentNode): string {
  return printWithReducedWhitespace(
    sortAST(hideCertainLiterals(document)),
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

export const getStoreKey = (signature: string) => `apq:${signature}`;

export function generateServiceIdHash(serviceId: string): string {
  return createHash('sha512')
    .update(serviceId)
    .digest('hex');
}

export function generateNormalizedDocumentHash(document: DocumentNode): string {
  return createHash('sha256')
    .update(formatDocumentForHashing(document))
    .digest('hex');
}

export function getOperationManifestUrl(
  hashedServiceId: string,
  schemaHash: string,
): string {
  return [urlOperationManifestBase, hashedServiceId, schemaHash].join('/');
}

export function hashForLogging(hash: string): string {
  if (typeof hash !== 'string') {
    return '<non-string>';
  }
  return hash.substring(0, 8);
}
