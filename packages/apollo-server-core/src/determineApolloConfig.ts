import { ApolloConfig, ApolloConfigInput, Logger } from 'apollo-server-types';
import createSHA from './utils/createSHA';

// This function combines the `apollo` constructor argument and some environment
// variables to come up with a full ApolloConfig.
export function determineApolloConfig(
  input: ApolloConfigInput | undefined,
  logger: Logger,
): ApolloConfig {
  const apolloConfig: ApolloConfig = { graphVariant: 'current' };

  const {
    APOLLO_KEY,
    APOLLO_GRAPH_ID,
    APOLLO_GRAPH_VARIANT,
  } = process.env;

  // Determine key.
  if (input?.key) {
    apolloConfig.key = input.key;
  } else if (APOLLO_KEY) {
    apolloConfig.key = APOLLO_KEY;
  }

  // Determine key hash.
  if (apolloConfig.key) {
    apolloConfig.keyHash = createSHA('sha512')
      .update(apolloConfig.key)
      .digest('hex');
  }

  // Determine graph id.
  if (input?.graphId) {
    apolloConfig.graphId = input.graphId;
  } else if (APOLLO_GRAPH_ID) {
    apolloConfig.graphId = APOLLO_GRAPH_ID;
  } else if (apolloConfig.key) {
    // This is the common case: if the given key is a graph token (starts with 'service:'),
    // then use the service name written in the key.
    const parts = apolloConfig.key.split(':', 2);
    if (parts[0] === 'service') {
      apolloConfig.graphId = parts[1];
    }
  }

  // Determine variant.
  if (input?.graphVariant) {
    apolloConfig.graphVariant = input.graphVariant;
  } else if (APOLLO_GRAPH_VARIANT) {
    apolloConfig.graphVariant = APOLLO_GRAPH_VARIANT;
  } else if (apolloConfig.key) {
    // Leave the value 'current' in apolloConfig.graphVariant.
    // We warn if it looks like they're trying to use Apollo registry features, but there's
    // no reason to warn if there's no key.
    logger.warn('No graph variant provided. Defaulting to `current`.');
  }

  return apolloConfig;
}
