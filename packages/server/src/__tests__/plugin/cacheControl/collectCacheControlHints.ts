import type { GraphQLSchema } from 'graphql';
import type { CacheHint } from '../../../externalTypes';
import {
  ApolloServer,
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
} from '../../..';

export async function collectCacheControlHintsAndPolicyIfCacheable(
  schema: GraphQLSchema,
  source: string,
  options: ApolloServerPluginCacheControlOptions = {},
): Promise<{
  hints: Map<string, CacheHint>;
  policyIfCacheable: Required<CacheHint> | null;
}> {
  const cacheHints = new Map<string, CacheHint>();
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginCacheControl({
        ...options,
        __testing__cacheHints: cacheHints,
      }),
      {
        async requestDidStart() {
          return {
            async willSendResponse({ response, overallCachePolicy }) {
              if (!response.result.extensions) {
                response.result.extensions = {};
              }
              response.result.extensions.__policyIfCacheable__ =
                overallCachePolicy.policyIfCacheable();
            },
          };
        },
      },
    ],
  });
  await server.start();
  const response = await server.executeOperation({ query: source });
  await server.stop();

  expect(response.result.errors).toBeUndefined();

  return {
    hints: cacheHints,
    policyIfCacheable: response.result.extensions!.__policyIfCacheable__ as any,
  };
}

export async function collectCacheControlHints(
  ...args: Parameters<typeof collectCacheControlHintsAndPolicyIfCacheable>
): Promise<Map<string, CacheHint>> {
  return (await collectCacheControlHintsAndPolicyIfCacheable(...args)).hints;
}
