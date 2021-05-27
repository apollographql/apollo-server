import { ApolloConfig, ApolloConfigInput, Logger } from 'apollo-server-types';
import createSHA from './utils/createSHA';
import type { EngineReportingOptions } from './plugin';

// This function combines the newer `apollo` constructor argument, the older
// `engine` constructor argument, and some environment variables to come up
// with a full ApolloConfig.
//
// The caller ensures that only one of the two constructor arguments is actually
// provided and warns if `engine` was provided, but it is this function's job
// to warn if old environment variables are used.
export function determineApolloConfig(
  input: ApolloConfigInput | undefined,
  // For backwards compatibility.
  // AS3: Drop support for deprecated 'engine'.
  engine: EngineReportingOptions<any> | boolean | undefined,
  logger: Logger,
): ApolloConfig {
  if (input && engine !== undefined) {
    // There's a more helpful error in the actual ApolloServer constructor.
    throw Error('Cannot pass both `apollo` and `engine`');
  }
  const apolloConfig: Partial<ApolloConfig> = {};

  const {
    APOLLO_KEY,
    APOLLO_GRAPH_REF,
    APOLLO_GRAPH_ID,
    APOLLO_GRAPH_VARIANT,
    // AS3: Drop support for deprecated `ENGINE_API_KEY` and `ENGINE_SCHEMA_TAG`.
    ENGINE_API_KEY,
    ENGINE_SCHEMA_TAG,
  } = process.env;

  // Determine key.
  if (input?.key) {
    apolloConfig.key = input.key;
  } else if (typeof engine === 'object' && engine.apiKey) {
    apolloConfig.key = engine.apiKey;
  } else if (APOLLO_KEY) {
    if (ENGINE_API_KEY) {
      logger.warn(
        'Using `APOLLO_KEY` since `ENGINE_API_KEY` (deprecated) is also set in the environment.',
      );
    }
    apolloConfig.key = APOLLO_KEY;
  } else if (ENGINE_API_KEY) {
    logger.warn(
      '[deprecated] The `ENGINE_API_KEY` environment variable has been renamed to `APOLLO_KEY`.',
    );
    apolloConfig.key = ENGINE_API_KEY;
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

  // Determine graph id.
  if (input?.graphId) {
    apolloConfig.graphId = input.graphId;
  } else if (APOLLO_GRAPH_ID) {
    apolloConfig.graphId = APOLLO_GRAPH_ID;
  }

  // Determine variant.
  if (input?.graphVariant) {
    apolloConfig.graphVariant = input.graphVariant;
  } else if (typeof engine === 'object' && engine.graphVariant) {
    if (engine.schemaTag) {
      throw new Error(
        'Cannot set more than one of apollo.graphVariant, ' +
          'engine.graphVariant, and engine.schemaTag. Please use apollo.graphVariant.',
      );
    }
    apolloConfig.graphVariant = engine.graphVariant;
  } else if (typeof engine === 'object' && engine.schemaTag) {
    logger.warn(
      '[deprecated] The `engine.schemaTag` option has been renamed to `apollo.graphVariant` ' +
        '(or you may set it with the `APOLLO_GRAPH_VARIANT` environment variable).',
    );
    apolloConfig.graphVariant = engine.schemaTag;
  } else if (APOLLO_GRAPH_VARIANT) {
    if (ENGINE_SCHEMA_TAG) {
      throw new Error(
        '`APOLLO_GRAPH_VARIANT` and `ENGINE_SCHEMA_TAG` (deprecated) environment variables must not both be set.',
      );
    }
    apolloConfig.graphVariant = APOLLO_GRAPH_VARIANT;
  } else if (ENGINE_SCHEMA_TAG) {
    logger.warn(
      '[deprecated] The `ENGINE_SCHEMA_TAG` environment variable has been renamed to `APOLLO_GRAPH_VARIANT`.',
    );
    apolloConfig.graphVariant = ENGINE_SCHEMA_TAG;
  }

  if (apolloConfig.graphRef) {
    if (apolloConfig.graphId) {
      throw new Error(
        'Cannot specify both graph ref and graph ID. Please use ' +
          '`apollo.graphRef` or `APOLLO_GRAPH_REF` without also setting the graph ID.',
      );
    }
    if (apolloConfig.graphVariant) {
      throw new Error(
        'Cannot specify both graph ref and graph variant. Please use ' +
          '`apollo.graphRef` or `APOLLO_GRAPH_REF` without also setting the graph ID.',
      );
    }

    // You've specified the graph ref, so split into id and variant (defaulting
    // variant to current).
    const at = apolloConfig.graphRef.indexOf('@');
    if (at === -1) {
      apolloConfig.graphId = apolloConfig.graphRef;
      apolloConfig.graphVariant = 'current';
    } else {
      apolloConfig.graphId = apolloConfig.graphRef.substring(0, at);
      apolloConfig.graphVariant = apolloConfig.graphRef.substring(at + 1);
    }
  } else {
    // Graph ref not specified. Let's try harder to get ID/variant, then join them.
    if (!apolloConfig.graphId && apolloConfig.key) {
      // If the given key is a graph token (starts with 'service:'), then use the
      // service name written in the key. (We will remove this parser in AS3.)
      const parts = apolloConfig.key.split(':', 2);
      if (parts[0] === 'service') {
        apolloConfig.graphId = parts[1];
      } else {
        throw Error(
          'You have specified an API key in `apollo.key` or `APOLLO_KEY`, ' +
            'but you have not specified your graph ref or graph ID and the key ' +
            'does not start with `service:`. Please specify your graph ref; for ' +
            'example, set `APOLLO_GRAPH_REF` to `my-graph-id@my-graph-variant`.',
        );
      }
    }
    if (!apolloConfig.graphVariant) {
      apolloConfig.graphVariant = 'current';
    }

    if (apolloConfig.graphId) {
      apolloConfig.graphRef = `${apolloConfig.graphId}@${apolloConfig.graphVariant}`;
    }
  }

  return apolloConfig as ApolloConfig; // can remove cast in AS3
}
