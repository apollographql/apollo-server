import { createHash } from '@apollo/utils.createhash';
import type { ApolloConfig, ApolloConfigInput } from './externalTypes/index.js';
import type { Logger } from '@apollo/utils.logger';

// This function combines the `apollo` constructor argument and some environment
// variables to come up with a full ApolloConfig.
export function determineApolloConfig(
  input: ApolloConfigInput | undefined,
  logger: Logger,
): ApolloConfig {
  const apolloConfig: ApolloConfig = {};

  const {
    APOLLO_KEY,
    APOLLO_GRAPH_REF,
    APOLLO_GRAPH_ID,
    APOLLO_GRAPH_VARIANT,
  } = process.env;

  // Determine key.
  if (input?.key) {
    apolloConfig.key = input.key.trim();
  } else if (APOLLO_KEY) {
    apolloConfig.key = APOLLO_KEY.trim();
  }
  if ((input?.key ?? APOLLO_KEY) !== apolloConfig.key) {
    logger.warn(
      'The provided API key has unexpected leading or trailing whitespace. ' +
        'Apollo Server will trim the key value before use.',
    );
  }

  // Assert API key is a valid header value, since it's going to be used as one
  // throughout.
  if (apolloConfig.key) {
    assertValidHeaderValue(apolloConfig.key);
  }

  // Determine key hash.
  if (apolloConfig.key) {
    apolloConfig.keyHash = createHash('sha512')
      .update(apolloConfig.key)
      .digest('hex');
  }

  // Determine graph ref, if provided together.
  if (input?.graphRef) {
    apolloConfig.graphRef = input.graphRef;
  } else if (APOLLO_GRAPH_REF) {
    apolloConfig.graphRef = APOLLO_GRAPH_REF;
  }

  // See if graph ID and variant were provided separately.
  const graphId = input?.graphId ?? APOLLO_GRAPH_ID;
  const graphVariant = input?.graphVariant ?? APOLLO_GRAPH_VARIANT;

  if (apolloConfig.graphRef) {
    if (graphId) {
      throw new Error(
        'Cannot specify both graph ref and graph ID. Please use ' +
          '`apollo.graphRef` or `APOLLO_GRAPH_REF` without also setting the graph ID.',
      );
    }
    if (graphVariant) {
      throw new Error(
        'Cannot specify both graph ref and graph variant. Please use ' +
          '`apollo.graphRef` or `APOLLO_GRAPH_REF` without also setting the graph variant.',
      );
    }
  } else if (graphId) {
    // Graph ref is not specified, but the ID is. We can construct the ref
    // from the ID and variant. Note that after this, we stop tracking the ID
    // and variant, because Apollo Server 3 does not assume that all graph refs
    // can be decomposed into ID and variant (except in the op reg plugin).
    apolloConfig.graphRef = graphVariant
      ? `${graphId}@${graphVariant}`
      : graphId;
  }

  return apolloConfig;
}

function assertValidHeaderValue(value: string) {
  // Ref: node-fetch@2.x `Headers` validation
  // https://github.com/node-fetch/node-fetch/blob/9b9d45881e5ca68757077726b3c0ecf8fdca1f29/src/headers.js#L18
  const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
  if (invalidHeaderCharRegex.test(value)) {
    const invalidChars = value.match(invalidHeaderCharRegex)!;
    throw new Error(
      `The API key provided to Apollo Server contains characters which are invalid as HTTP header values. The following characters found in the key are invalid: ${invalidChars.join(
        ', ',
      )}. Valid header values may only contain ASCII visible characters. If you think there is an issue with your key, please contact Apollo support.`,
    );
  }
}
