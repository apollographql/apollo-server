import * as assert from 'assert';
import { pluginName, generateOperationHash, getCacheKey } from './common';
import {
  ApolloServerPlugin,
  GraphQLServiceContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { ForbiddenError, ApolloError } from 'apollo-server-errors';
import Agent from './agent';
import { GraphQLSchema } from 'graphql/type';
import { generateSchemaHash } from './schema';
import { KeyValueCache } from 'apollo-server-caching';

interface Options {
  debug?: boolean;
}

export default class extends ApolloServerPlugin {
  private agent?: Agent;
  private cache?: KeyValueCache;
  private options: Options = Object.create(null);

  constructor(options?: Options) {
    super();
    Object.assign(this.options, options);
  }

  async serverWillStart({
    schema,
    engine,
    persistedQueries,
  }: GraphQLServiceContext): Promise<void> {
    assert.ok(schema instanceof GraphQLSchema);
    const schemaHash = await generateSchemaHash(schema);

    if (!engine || !engine.serviceID) {
      throw new Error(
        `${pluginName}: The Engine API key must be set to use the operation registry.`,
      );
    }

    if (!persistedQueries || !persistedQueries.cache) {
      throw new Error(
        `${pluginName}: Persisted queries must be enabled to use the operation registry.`,
      );
    }

    // We use which ever cache store is in place for persisted queries, be that
    // the default in-memory store, or other stateful store resource.
    const cache = (this.cache = persistedQueries.cache);

    this.agent = new Agent({
      schemaHash,
      engine,
      cache,
      debug: this.options.debug,
    });

    await this.agent.start();
  }

  requestDidStart(): GraphQLRequestListener<any> {
    const plugin = this;
    return {
      async didResolveOperation({ request: { query }, queryHash }) {
        // This shouldn't happen under normal operation since `cache` will be
        // set in `serverWillStart` and `requestDidStart` (this) comes after.
        if (!plugin.cache) {
          throw new Error('Unable to access cache.');
        }

        const hash = query
          ? generateOperationHash(query) // If we received a `query`, hash it!
          : queryHash; // Otherwise, we'll use the APQ `queryHash`.

        // If the document itself was missing and we didn't receive a
        // `queryHash` (the persisted query `sha256Hash` from the APQ
        // `extensions`), then we have nothing to work with.
        if (!hash) {
          throw new ApolloError('No document.');
        }

        // Try to fetch the operation from the cache of operations we're
        // currently aware of, which has been populated by the operation
        // registry.
        const cacheFetch = await plugin.cache.get(getCacheKey(hash));
        if (!cacheFetch) {
          throw new ForbiddenError('Execution forbidden');
        }
      },
    };
  }
}
