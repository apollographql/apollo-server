import * as assert from 'assert';
import {
  pluginName,
  generateNormalizedDocumentHash,
  getStoreKey,
  hashForLogging,
} from './common';
import {
  ApolloServerPlugin,
  GraphQLServiceContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { ForbiddenError, ApolloError } from 'apollo-server-errors';
import Agent from './agent';
import { GraphQLSchema } from 'graphql/type';
import { InMemoryLRUCache } from 'apollo-server-caching';
import loglevel from 'loglevel';
import loglevelDebug from 'loglevel-debug';

interface Options {
  debug?: boolean;
  forbidUnregisteredOperations?: boolean;
}

export default function plugin(options: Options = Object.create(null)) {
  let agent: Agent;
  let store: InMemoryLRUCache;

  // Setup logging facilities, scoped under the appropriate name.
  const logger = loglevel.getLogger(`apollo-server:${pluginName}`);

  // Support DEBUG environment variable, à la https://npm.im/debug/.
  loglevelDebug(logger);

  // And also support the `debug` option, if it's truthy.
  if (options.debug === true) {
    logger.enableAll();
  }

  // Options shouldn't be changed after the plugin has been initiated.
  // If this proves to be necessary in the future, we can relax this at that
  // time depending on the usecase.
  Object.freeze(options);

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

      // An LRU store with no `maxSize` is effectively an InMemoryStore and
      // exactly what we want for this purpose.
      store = new InMemoryLRUCache({ maxSize: Infinity });

      logger.debug('Initializing operation registry agent...');

      agent = new Agent({
        schemaHash,
        engine,
        store,
        logger,
      });

      await agent.start();
    },

    requestDidStart(): GraphQLRequestListener<any> {
      return {
        async didResolveOperation({ document }) {
          // This shouldn't happen under normal operation since `store` will be
          // set in `serverWillStart` and `requestDidStart` (this) comes after.
          if (!store) {
            throw new Error('Unable to access store.');
          }

          const hash = generateNormalizedDocumentHash(document);

          // If the document itself was missing and we didn't receive a
          // `queryHash` (the persisted query `sha256Hash` from the APQ
          // `extensions`), then we have nothing to work with.
          if (!hash) {
            throw new ApolloError('No document.');
          }

          // The hashes are quite long and it seems we can get by with a substr.
          const logHash = hashForLogging(hash);

          logger.debug(`${logHash}: Looking up operation in local registry.`);

          // Try to fetch the operation from the store of operations we're
          // currently aware of, which has been populated by the operation
          // registry.
          const storeFetch = await store.get(getStoreKey(hash));

          // If we have a hit, we'll return immediately, signaling that we're
          // not intending to block this request.
          if (storeFetch) {
            logger.debug(
              `${logHash}: Permitting operation found in local registry.`,
            );
            return;
          }

          // If the forbidding of operations isn't enabled, we can just return
          // since this will only be used for stats.
          if (!options.forbidUnregisteredOperations) {
            logger.debug(`${logHash}: Not found in local registry.  Denying.`);
          }

          logger.debug(
            `${logHash}: Denying operation since it's missing from the local registry.`,
          );
          throw new ForbiddenError('Execution forbidden');
        },
      };
    },
  });
}
