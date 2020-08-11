import { pluginName, getStoreKey, signatureForLogging } from './common';
import {
  ApolloServerPlugin,
  GraphQLServiceContext,
  GraphQLRequestListener,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import {
  /**
   * We alias these to different names entirely since the user-facing values
   * which are present in their manifest (signature and document) are probably
   * the most important concepts to rally around right now, in terms of
   * approachability to the implementor.  A future version of the
   * `apollo-graphql` package should rename them to make this more clear.
   */
  operationHash as operationSignature,
  defaultOperationRegistrySignature as defaultOperationRegistryNormalization,
} from 'apollo-graphql';
import { ForbiddenError, ApolloError } from 'apollo-server-errors';
import Agent from './agent';
import { InMemoryLRUCache } from 'apollo-server-caching';
import loglevel from 'loglevel';
import { fetch } from "apollo-server-env";

type ForbidUnregisteredOperationsPredicate = (
  requestContext: GraphQLRequestContext,
) => boolean;

export interface OperationRegistryRequestContext {
  signature: string;
  normalizedDocument: string;
}

export interface Operation {
  signature: string;
  document: string;
}

export interface OperationManifest {
  version: number;
  operations: Array<Operation>;
}

export interface Options {
  debug?: boolean;
  fetcher?: typeof fetch;
  forbidUnregisteredOperations?:
    | boolean
    | ForbidUnregisteredOperationsPredicate;
  dryRun?: boolean;
  graphVariant?: string;
  onUnregisteredOperation?: (
    requestContext: GraphQLRequestContext,
    operationRegistryRequestContext: OperationRegistryRequestContext,
  ) => void;
  onForbiddenOperation?: (
    requestContext: GraphQLRequestContext,
    operationRegistryRequestContext: OperationRegistryRequestContext,
  ) => void;
}

export default function plugin(options: Options = Object.create(null)) {
  let agent: Agent;
  let store: InMemoryLRUCache;
  const graphVariant =
    options.graphVariant || process.env.APOLLO_GRAPH_VARIANT || 'current';

  // Setup logging facilities, scoped under the appropriate name.
  const logger = loglevel.getLogger(`apollo-server:${pluginName}`);
  const dryRunPrefix = '[DRYRUN]';

  // And also support the `debug` option, if it's truthy.
  if (options.debug === true) {
    logger.enableAll();
  }

  // Notify about logging as a result of dryRun === true
  if (options.dryRun === true && options.debug !== false) {
    logger.enableAll();
    logger.debug(
      `${dryRunPrefix} Operation registry logging enabled because options.dryRun is true.`,
    );
    if (options.forbidUnregisteredOperations) {
      logger.info(
        `${dryRunPrefix} Allowing all operations since options.dryRun is true. \
Operations will still be reported to Apollo trace warehouse as forbidden \
for observability purposes, but all operations will be permitted.`,
      );
    }
  }

  // Options shouldn't be changed after the plugin has been initiated.
  // If this proves to be necessary in the future, we can relax this at that
  // time depending on the usecase.
  Object.freeze(options);

  return (): ApolloServerPlugin => ({
    async serverWillStart({
      engine,
    }: GraphQLServiceContext): Promise<void> {
      logger.debug('Initializing operation registry plugin.');

      if (!engine || !engine.serviceID) {
        const messageEngineConfigurationRequired =
          'The Apollo API key must be set to use the operation registry.';
        throw new Error(`${pluginName}: ${messageEngineConfigurationRequired}`);
      }

      logger.debug(
        `Operation registry is configured for '${engine.serviceID}'.`);

      // An LRU store with no `maxSize` is effectively an InMemoryStore and
      // exactly what we want for this purpose.
      store = new InMemoryLRUCache({ maxSize: Infinity });

      logger.debug('Initializing operation registry agent...');

      agent = new Agent({
        graphVariant,
        engine,
        store,
        logger,
        fetcher: options.fetcher,
      });

      await agent.start();
    },

    requestDidStart(): GraphQLRequestListener<any> {
      return {
        async didResolveOperation(requestContext) {
          const documentFromRequestContext = requestContext.document;
          // This shouldn't happen under normal operation since `store` will be
          // set in `serverWillStart` and `requestDidStart` (this) comes after.
          if (!store) {
            throw new Error('Unable to access store.');
          }

          const normalizedDocument = defaultOperationRegistryNormalization(
            documentFromRequestContext,

            // XXX The `operationName` is set from the AST, not from the
            // request `operationName`.  If `operationName` is `null`,
            // then the operation is anonymous.  However, it's not possible
            // to register anonymous operations from the `apollo` CLI.
            // We could fail early, however, we still want to abide by the
            // desires of `forbidUnregisteredOperations`, so we'll allow
            // this signature to be generated anyway.  It could not be in the
            // manifest, so this would be okay and allow this code to remain
            // less conditional-y, eventually forbidding the operation when
            // the signature is absent and `forbidUnregisteredOperations` is on.
            requestContext.operationName || '',
          );

          const signature = operationSignature(normalizedDocument);

          if (!signature) {
            throw new ApolloError('No document.');
          }

          // The signatures are quite long so we truncate to a prefix of it.
          const logSignature = signatureForLogging(signature);

          logger.debug(
            `${logSignature}: Looking up operation in local registry.`,
          );

          // Try to fetch the operation from the store of operations we're
          // currently aware of, which has been populated by the operation
          // registry.
          const storeFetch = await store.get(getStoreKey(signature));

          // If we have a hit, we'll return immediately, signaling that we're
          // not intending to block this request.
          if (storeFetch) {
            logger.debug(
              `${logSignature}: Permitting operation found in local registry.`,
            );
            requestContext.metrics.registeredOperation = true;
            return;
          } else {
            // If defined, this method should not block, whether async or not.
            if (typeof options.onUnregisteredOperation === 'function') {
              const onUnregisteredOperation = options.onUnregisteredOperation;
              Promise.resolve().then(() => {
                onUnregisteredOperation(requestContext, {
                  signature,
                  normalizedDocument,
                });
              });
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
          let shouldForbidOperation: boolean =
            typeof options.forbidUnregisteredOperations === 'boolean'
              ? options.forbidUnregisteredOperations
              : typeof options.forbidUnregisteredOperations === 'function';

          if (typeof options.forbidUnregisteredOperations === 'function') {
            logger.debug(
              `${logSignature}: Calling 'forbidUnregisteredOperations' predicate function with requestContext...`,
            );

            try {
              const predicateResult = options.forbidUnregisteredOperations(
                requestContext,
              );

              logger.debug(
                `${logSignature}: The 'forbidUnregisteredOperations' predicate function returned ${predicateResult}`,
              );

              // If we've received a boolean back from the predicate function,
              // we will use that value.  However, if we receive no return value
              // (indicate a mis-use), then we will resort back to the default
              // enforcement mode; an explicit boolean `false` is required to
              // disable enforcement when a predicate function is in use.
              if (typeof predicateResult === 'boolean') {
                shouldForbidOperation = predicateResult;
              } else {
                logger.warn(
                  `${logSignature} Predicate function did not return a boolean response. Got ${predicateResult}`,
                );
              }
            } catch (err) {
              // If an error occurs within the forbidUnregisteredOperations
              // predicate function, we should assume that the implementor
              // had a security-wise intention and remain in enforcement mode.
              logger.error(
                `${logSignature}: An error occurred within the 'forbidUnregisteredOperations' predicate function: ${err}`,
              );
            }
          }

          // Whether we're in dryRun mode or not, the decision as to whether
          // or not we'll be forbidding execution has already been decided.
          // Therefore, we'll return early and avoid nesting this entire
          // remaining 30+ line block in a `if (shouldForbidOperation)` fork.
          if (!shouldForbidOperation) {
            return;
          }

          // If the user explicitly set `forbidUnregisteredOperations` to either
          // `true` or a (predicate) function which returns `true` we'll
          // report it within metrics as forbidden, even though we may be
          // running in `dryRun` mode.  This allows the user to incrementally
          // go through their code-base and ensure that they've reached
          // an "inbox zero" - so to speak - of operations needing registration.
          if (options.forbidUnregisteredOperations) {
            logger.debug(
              `${logSignature} Reporting operation as forbidden to Apollo trace warehouse.`,
            );
            requestContext.metrics.forbiddenOperation = true;
          }

          if (shouldForbidOperation) {
            // If defined, this method should not block, whether async or not.
            if (typeof options.onForbiddenOperation === 'function') {
              const onForbiddenOperation = options.onForbiddenOperation;
              Promise.resolve().then(() => {
                onForbiddenOperation(requestContext, {
                  signature,
                  normalizedDocument,
                });
              });
            }
          }

          if (options.dryRun) {
            logger.debug(
              `${dryRunPrefix} ${logSignature}: Operation ${requestContext.operationName} would have been forbidden.`,
            );
            return;
          }

          logger.debug(
            `${logSignature}: Execution denied because 'forbidUnregisteredOperations' was enabled for this request and the operation was not found in the local operation registry.`,
          );
          const error = new ForbiddenError(
            'Execution forbidden: Operation not found in operation registry',
          );
          Object.assign(error.extensions, {
            operationSignature: signature,
            exception: {
              message: `Please register your operation with \`npx apollo client:push --tag="${graphVariant}"\`. See https://www.apollographql.com/docs/platform/operation-registry/ for more details.`,
            },
          });
          throw error;
        },
      };
    },
  });
}
