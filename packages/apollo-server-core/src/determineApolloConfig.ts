import type { ApolloConfig, ApolloConfigInput } from 'apollo-server-types';
import createSHA from './utils/createSHA';

// This function combines the `apollo` constructor argument and some environment
// variables to come up with a full ApolloConfig.
export function determineApolloConfig(
  input: ApolloConfigInput | undefined,
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
          '`apollo.graphRef` or `APOLLO_GRAPH_REF` without also setting the graph ID.',
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
