import * as assert from 'assert';
import { pluginName, getStoreKey, hashForLogging } from './common';
import {
  ApolloServerPlugin,
  GraphQLServiceContext,
  GraphQLRequestListener,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import {
  operationHash,
  defaultOperationRegistrySignature,
} from 'apollo-graphql';
import { ForbiddenError, ApolloError } from 'apollo-server-errors';
import Agent, { OperationManifest } from './agent';
import { GraphQLSchema } from 'graphql/type';
import { InMemoryLRUCache } from 'apollo-server-caching';
import loglevel from 'loglevel';
import loglevelDebug from 'loglevel-debug';
import { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';

type ForbidUnregisteredOperationsPredicate = (
  requestContext: GraphQLRequestContext,
) => boolean;

interface Options {
  debug?: boolean;
  forbidUnregisteredOperations?:
    | boolean
    | ForbidUnregisteredOperationsPredicate;
  dryRun?: boolean;
  schemaTag?: string;
  onUnregisteredOperation?: (requestContext: GraphQLRequestContext) => void;
  onForbiddenOperation?: (requestContext: GraphQLRequestContext) => void;
  willUpdateManifest?: (
    newManifest?: OperationManifest,
    oldManifest?: OperationManifest,
  ) => PromiseOrValue<OperationManifest>;
}

export default function plugin(options: Options = Object.create(null)) {
  let agent: Agent;
  let store: InMemoryLRUCache;
  let schemaTag = options.schemaTag || 'current';

  // Setup logging facilities, scoped under the appropriate name.
  const logger = loglevel.getLogger(`apollo-server:${pluginName}`);
  const dryRunPrefix = '[DRYRUN]';

  // Support DEBUG environment variable, à la https://npm.im/debug/.
  loglevelDebug(logger);

  // And also support the `debug` option, if it's truthy.
  if (options.debug === true) {
    logger.enableAll();
  }

  // Notify about logging as a result of dryRun === true
  if (options.dryRun === true) {
    logger.enableAll();
    logger.debug(
      `${dryRunPrefix} Operation registry logging enabled because options.dryRun is true.`,
    );
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

      // An LRU store with no `maxSize` is effectively an InMemoryStore and
      // exactly what we want for this purpose.
      store = new InMemoryLRUCache({ maxSize: Infinity });

      logger.debug('Initializing operation registry agent...');

      agent = new Agent({
        schemaHash,
        schemaTag,
        engine,
        store,
        logger,
        willUpdateManifest: options.willUpdateManifest,
      });

      await agent.start();
    },

    requestDidStart(): GraphQLRequestListener<any> {
      return {
        async didResolveOperation(requestContext) {
          const document = requestContext.document;
          // This shouldn't happen under normal operation since `store` will be
          // set in `serverWillStart` and `requestDidStart` (this) comes after.
          if (!store) {
            throw new Error('Unable to access store.');
          }

          const hash = operationHash(
            defaultOperationRegistrySignature(
              document,

              // XXX The `operationName` is set from the AST, not from the
              // request `operationName`.  If `operationName` is `null`,
              // then the operation is anonymous.  However, it's not possible
              // to register anonymous operations from the `apollo` CLI.
              // We could fail early, however, we still want to abide by the
              // desires of `forbidUnregisteredOperations`, so we'll allow
              // this hash be generated anyway.  The hash cannot be in the
              // manifest, so this would be okay and allow this code to remain
              // less conditional-y, eventually forbidding the operation when
              // the hash is not found and `forbidUnregisteredOperations` is on.
              requestContext.operationName || '',
            ),
          );

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
            requestContext.metrics.registeredOperation = true;
            return;
          } else {
            if (options.onUnregisteredOperation) {
              options.onUnregisteredOperation(requestContext);
            }
          }

          // If the `forbidUnregisteredOperations` option is set explicitly to
          // a boolean option, we'll use that option as the default.  In the
          // event that it is instead a predicate function (which can return
          // true or false dynamically based on, for example, the context) then
          // we will default to `true` and let the execution of the function
          // decide whether not it should be disabled based on an explicit
          // return value from the function.  In the event of an error, or if
          // the function does not return a value, we will fail-safe to
          // forbidding unregistered operations.
          let forbidUnregisteredOperations: boolean =
            typeof options.forbidUnregisteredOperations === 'boolean'
              ? options.forbidUnregisteredOperations
              : typeof options.forbidUnregisteredOperations !== 'undefined';

          if (typeof options.forbidUnregisteredOperations === 'function') {
            logger.debug(
              `${logHash}: Calling 'forbidUnregisteredOperations' predicate function with requestContext...`,
            );

            try {
              const predicateResult = options.forbidUnregisteredOperations(
                requestContext,
              );

              logger.debug(
                `${logHash}: The 'forbidUnregisteredOperations' predicate function returned ${predicateResult}`,
              );

              // If we've received a boolean back from the predicate function,
              // we will use that value.  However, if we receive no return value
              // (indicate a mis-use), then we will resort back to the default
              // enforcement mode; an explicit boolean `false` is required to
              // disable enforcement when a predicate function is in use.
              if (typeof predicateResult === 'boolean') {
                forbidUnregisteredOperations = predicateResult;
              }
            } catch (err) {
              // If an error occurs within the forbidUnregisteredOperations
              // predicate function, we should assume that the implementor
              // had a security-wise intention and remain in enforcement mode.
              logger.error(
                `${logHash}: An error occurred within the 'forbidUnregisteredOperations' predicate function: ${err}`,
              );
            }
          }

          // If the forbidding of operations isn't enabled, we can just return
          // since this will only be used for stats.
          if (forbidUnregisteredOperations) {
            logger.debug(
              `${options.dryRun &&
                dryRunPrefix} ${logHash}: Execution denied because 'forbidUnregisteredOperations' was enabled for this request and the operation was not found in the local operation registry.`,
            );

            requestContext.metrics.forbiddenOperation = true;
            if (options.onForbiddenOperation) {
              options.onForbiddenOperation(requestContext);
            }
            if (!options.dryRun) {
              throw new ForbiddenError('Execution forbidden');
            } else {
              logger.debug(
                `${dryRunPrefix} ${logHash}: Operation ${
                  requestContext.operationName
                } would have been forbidden.`,
              );
            }
          }

          logger.debug(
            `${logHash}: Execution of operation ${
              requestContext.operationName
            } permitted without a matching entry in the local operation registry because 'forbidUnregisteredOperations' was not enabled for this request.`,
          );
        },
      };
    },
  });
}
