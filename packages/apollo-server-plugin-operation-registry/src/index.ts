import * as assert from 'assert';
import { pluginName, generateOperationHash, getCacheKey } from './common';
import {
  ApolloServerPlugin,
  GraphQLServiceContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import Agent from './agent';
import { GraphQLSchema } from 'graphql/type';
import { generateSchemaHash } from './schema';
import { KeyValueCache } from 'apollo-server-caching';

export default class extends ApolloServerPlugin {
  private agent?: Agent;
  private cache?: KeyValueCache;

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

    this.agent = new Agent({ schemaHash, engine, cache, debug: true });
    await this.agent.start();
  }

  requestDidStart(): GraphQLRequestListener<any> {
    const cache = this.cache;

    return {
      async prepareRequest({ request }) {
        if (!cache) {
          throw new Error('Unable to access required cache.');
        }

        // XXX This isn't really right and this totally breaks APQ today, but:
        //   1) TypeScript seemed to want me to guard against this; and
        //   2) I'm not touching persistedQueries today.
        if (!request.query) {
          throw new Error('Document query was not received.');
        }

        // XXX This needs to utilize a better cache store and persist the
        // parsed document to the rest of the request to avoid re-validation.
        const hash = generateOperationHash(request.query);

        // Try to fetch the operation from the cache of operations we're
        // currently aware of, which has been populated by the operation
        // registry.
        const cacheFetch = await cache.get(getCacheKey(hash));

        if (!cacheFetch) {
          throw new Error('Execution forbidden.');
        }
      },
    };
  }
}
