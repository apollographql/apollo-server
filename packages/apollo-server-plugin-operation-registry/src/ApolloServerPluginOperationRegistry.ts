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
import { KeyValueCache } from 'apollo-server-caching';
import loglevel from 'loglevel';

interface Options {
  debug?: boolean;
}

export default function plugin(options: Options = Object.create(null)) {
  let agent: Agent;
  let cache: KeyValueCache;

  // Setup logging facilities, scoped under the appropriate name.
  const logger = loglevel.getLogger(`apollo-server:${pluginName}`);

  // Enable debugging if the `debug` option is true.
  if (options.debug === true) {
    logger.enableAll();
  }

  return (): ApolloServerPlugin => ({
    async serverWillStart({
      schema,
      schemaHash,
      engine,
      persistedQueries,
    }: GraphQLServiceContext): Promise<void> {
      logger.debug('Initializing operation registry plugin.');

      assert.ok(schema instanceof GraphQLSchema);

      if (!engine || !engine.serviceID) {
        const messageEngineConfigurationRequired =
          'The Engine API key must be set to use the operation registry.';
        throw new Error(`${pluginName}: ${messageEngineConfigurationRequired}`);
      }

      logger.debug(
        `Operation registry is configured for '${
          engine.serviceID
        }'.  The schema hash is ${schemaHash}.`,
      );

      if (!persistedQueries || !persistedQueries.cache) {
        const messagePersistedQueriesRequired =
          'Persisted queries must be enabled to use the operation registry.';
        logger.error(messagePersistedQueriesRequired);
        throw new Error(`${pluginName}: ${messagePersistedQueriesRequired}`);
      }

      // We currently use which ever store is in place for persisted queries,
      // be that the default in-memory store, or other stateful store resource.
      // That said, if this backing store ejects items, it should be noted that
      // those ejected operations will no longer be permitted!
      cache = persistedQueries.cache;

      logger.debug('Initializing operation registry agent...');

      agent = new Agent({
        schemaHash,
        engine,
        cache,
        logger,
      });

      await agent.start();
    },

    requestDidStart(): GraphQLRequestListener<any> {
      return {
        async didResolveOperation({ request: { query }, queryHash }) {
          // This shouldn't happen under normal operation since `cache` will be
          // set in `serverWillStart` and `requestDidStart` (this) comes after.
          if (!cache) {
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

          logger.debug(`Looking up operation in local registry.`);

          // Try to fetch the operation from the cache of operations we're
          // currently aware of, which has been populated by the operation
          // registry.
          const cacheFetch = await cache.get(getCacheKey(hash));

          // If we have a hit, we'll return immediately, signaling that we're
          // not intending to block this request.
          if (cacheFetch) {
            logger.debug(`Permitting operation found in local registry.`);
            return;
          }

          logger.debug(
            `Denying operation since it's missing from the local registry.`,
          );
          throw new ForbiddenError('Execution forbidden');
        },
      };
    },
  });
}
