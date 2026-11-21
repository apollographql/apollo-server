import { ApolloServer } from '../../..';
import { ApolloServerPluginCacheControl } from '../../../plugin/cacheControl';
import { describe, it, expect } from '@jest/globals';

const goodDefinition = `#graphql
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope!
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
`;

const queryType = `#graphql
  type Query {
    hello: String @cacheControl(maxAge: 10, scope: PUBLIC)
  }
`;

async function startAndStop(
  typeDefs: string,
  options?: Parameters<typeof ApolloServerPluginCacheControl>[0],
) {
  const server = new ApolloServer({
    typeDefs,
    plugins: options ? [ApolloServerPluginCacheControl(options)] : [],
  });
  await server.start();
  await server.stop();
}

describe('@cacheControl directive definition check', () => {
  it('accepts the documented definition', async () => {
    await startAndStop(goodDefinition + queryType);
  });

  it('accepts a differently named scope enum and a subset of locations', async () => {
    await startAndStop(`#graphql
      enum Scope {
        PRIVATE
        PUBLIC
      }
      directive @cacheControl(maxAge: Int, scope: Scope!) on FIELD_DEFINITION
      ${queryType}
    `);
  });

  it('accepts schemas that do not define the directive', async () => {
    await startAndStop('type Query { hello: String }');
  });

  it('rejects a nullable scope', async () => {
    await expect(
      startAndStop(
        goodDefinition.replace(
          'scope: CacheControlScope!',
          'scope: CacheControlScope',
        ) + queryType,
      ),
    ).rejects.toThrow(
      /its `scope` argument has nullable type `CacheControlScope`[\s\S]*scope: CacheControlScope!/,
    );
  });

  it('rejects a missing scope', async () => {
    await expect(
      startAndStop(`#graphql
        directive @cacheControl(maxAge: Int) on FIELD_DEFINITION
        type Query {
          hello: String @cacheControl(maxAge: 10)
        }
      `),
    ).rejects.toThrow('it has no `scope` argument');
  });

  it('rejects an enum with other values', async () => {
    await expect(
      startAndStop(
        goodDefinition.replace('PRIVATE\n', 'PRIVATE\n    SECRET\n') +
          queryType,
      ),
    ).rejects.toThrow('has values PRIVATE, PUBLIC, SECRET rather than exactly');
  });

  it('rejects unexpected arguments and locations', async () => {
    await expect(
      startAndStop(
        goodDefinition.replace(
          'inheritMaxAge: Boolean',
          'inheritMaxAge: Boolean\n    ttl: Int',
        ) + queryType,
      ),
    ).rejects.toThrow('it has an unexpected `ttl` argument');
    await expect(
      startAndStop(
        goodDefinition.replace('| UNION', '| UNION | ARGUMENT_DEFINITION') +
          queryType,
      ),
    ).rejects.toThrow('it is defined on the ARGUMENT_DEFINITION location');
  });

  it('can be disabled', async () => {
    await startAndStop(
      goodDefinition.replace(
        'scope: CacheControlScope!',
        'scope: CacheControlScope',
      ) + queryType,
      { validateDirectiveDefinition: false },
    );
  });
});
