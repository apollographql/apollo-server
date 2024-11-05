import type { CacheHint } from '@apollo/cache-control-types';
import type { FormattedExecutionResult, GraphQLSchema } from 'graphql';
import { ApolloServer } from '../../..';
import {
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
} from '../../../plugin/cacheControl';
import { expect } from '@jest/globals';
import { ObjMap } from 'graphql/jsutils/ObjMap';

export async function collectCacheControlHintsAndPolicyIfCacheable(
  schema: GraphQLSchema,
  source: string,
  options: ApolloServerPluginCacheControlOptions = {},
): Promise<{
  hints: Map<string, CacheHint>;
  policyIfCacheable: Required<CacheHint> | null;
}> {
  const { hints, policyIfCacheable, response } =
    await executeOperationWithCacheControl(schema, source, options);

  expect(response.errors).toBeUndefined();

  return {
    hints,
    policyIfCacheable,
  };
}

export async function executeOperationWithCacheControl(
  schema: GraphQLSchema,
  source: string,
  options: ApolloServerPluginCacheControlOptions = {},
): Promise<{
  hints: Map<string, CacheHint>;
  policyIfCacheable: Required<CacheHint> | null;
  response: FormattedExecutionResult<Record<string, unknown>, ObjMap<unknown>>;
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
              if (!('singleResult' in response.body)) {
                throw Error('expected single result');
              }

              if (!response.body.singleResult.extensions) {
                response.body.singleResult.extensions = {};
              }
              response.body.singleResult.extensions.__policyIfCacheable__ =
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

  if (!('singleResult' in response.body)) {
    throw new Error('expected single result');
  }

  return {
    hints: cacheHints,
    policyIfCacheable: response.body.singleResult.extensions!
      .__policyIfCacheable__ as any,
    response: response.body.singleResult,
  };
}

export async function collectCacheControlHints(
  ...args: Parameters<typeof collectCacheControlHintsAndPolicyIfCacheable>
): Promise<Map<string, CacheHint>> {
  return (await collectCacheControlHintsAndPolicyIfCacheable(...args)).hints;
}
