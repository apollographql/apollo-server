import {
  GraphQLSchema,
  GraphQLFieldResolver,
  specifiedRules,
  DocumentNode,
  OperationDefinitionNode,
  getOperationAST,
  ExecutionArgs,
  ExecutionResult,
  GraphQLError,
} from 'graphql';
import * as graphql from 'graphql';
import {
  GraphQLExtension,
  GraphQLExtensionStack,
  enableGraphQLExtensions,
} from 'graphql-extensions';
import { DataSource } from 'apollo-datasource';
import { PersistedQueryOptions } from '.';
import {
  CacheControlExtension,
  CacheControlExtensionOptions,
} from 'apollo-cache-control';
import { TracingExtension } from 'apollo-tracing';
import {
  fromGraphQLError,
  SyntaxError,
  ValidationError,
  PersistedQueryNotSupportedError,
  PersistedQueryNotFoundError,
} from 'apollo-server-errors';
import { createHash } from 'crypto';
import {
  GraphQLRequest,
  GraphQLResponse,
  GraphQLRequestContext,
  InvalidGraphQLRequestError,
  ValidationRule,
} from './requestPipelineAPI';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  DidEndHook,
} from 'apollo-server-plugin-base';

export {
  GraphQLRequest,
  GraphQLResponse,
  GraphQLRequestContext,
  InvalidGraphQLRequestError,
};

export interface GraphQLRequestPipelineConfig<TContext> {
  schema: GraphQLSchema;

  rootValue?: ((document: DocumentNode) => any) | any;
  validationRules?: ValidationRule[];
  fieldResolver?: GraphQLFieldResolver<any, TContext>;

  dataSources?: () => DataSources<TContext>;

  extensions?: Array<() => GraphQLExtension>;
  tracing?: boolean;
  persistedQueries?: PersistedQueryOptions;
  cacheControl?: CacheControlExtensionOptions;

  formatError?: Function;
  formatResponse?: Function;

  plugins?: ApolloServerPlugin[];
}

export type DataSources<TContext> = {
  [name: string]: DataSource<TContext>;
};

export interface GraphQLRequestPipeline<TContext> {
  willExecuteOperation?(operation: OperationDefinitionNode): void;
}

export class GraphQLRequestPipeline<TContext> {
  constructor(private config: GraphQLRequestPipelineConfig<TContext>) {
    enableGraphQLExtensions(config.schema);
  }

  async processRequest(
    requestContext: GraphQLRequestContext<TContext>,
  ): Promise<GraphQLResponse> {
    const config = this.config;

    const requestListeners: GraphQLRequestListener<TContext>[] = [];
    if (config.plugins) {
      for (const plugin of config.plugins) {
        if (!plugin.requestDidStart) continue;
        const listener = plugin.requestDidStart(requestContext);
        if (listener) {
          requestListeners.push(listener);
        }
      }
    }

    const dispatcher = new GraphQLRequestListenerDispatcher(requestListeners);

    const extensionStack = this.initializeExtensionStack();
    (requestContext.context as any)._extensionStack = extensionStack;

    this.initializeDataSources(requestContext);

    await dispatcher.prepareRequest(requestContext);

    const request = requestContext.request;

    let { query, extensions } = request;

    let persistedQueryHit = false;
    let persistedQueryRegister = false;

    if (!query) {
      if (extensions && extensions.persistedQuery) {
        // It looks like we've received an Apollo Persisted Query. Check if we
        // support them. In an ideal world, we always would, however since the
        // middleware options are created every request, it does not make sense
        // to create a default cache here and save a referrence to use across
        // requests
        if (
          !this.config.persistedQueries ||
          !this.config.persistedQueries.cache
        ) {
          throw new PersistedQueryNotSupportedError();
        } else if (extensions.persistedQuery.version !== 1) {
          throw new InvalidGraphQLRequestError(
            'Unsupported persisted query version',
          );
        }

        const sha = extensions.persistedQuery.sha256Hash;

        if (query === undefined) {
          query =
            (await this.config.persistedQueries.cache.get(`apq:${sha}`)) ||
            undefined;
          if (query) {
            persistedQueryHit = true;
          } else {
            throw new PersistedQueryNotFoundError();
          }
        } else {
          const hash = createHash('sha256');
          const calculatedSha = hash.update(query).digest('hex');

          if (sha !== calculatedSha) {
            throw new InvalidGraphQLRequestError(
              'provided sha does not match query',
            );
          }
          persistedQueryRegister = true;

          // Do the store completely asynchronously
          (async () => {
            // We do not wait on the cache storage to complete
            return (
              this.config.persistedQueries &&
              this.config.persistedQueries.cache.set(`apq:${sha}`, query)
            );
          })().catch(error => {
            console.warn(error);
          });
        }
      }
    }

    if (!query) {
      throw new InvalidGraphQLRequestError('Must provide query string.');
    }

    const requestDidEnd = extensionStack.requestDidStart({
      request: request.http,
      queryString: request.query,
      operationName: request.operationName,
      variables: request.variables,
      extensions: request.extensions,
      persistedQueryHit,
      persistedQueryRegister,
    });

    const parsingDidEnd = await dispatcher.parsingDidStart(requestContext);

    try {
      let document: DocumentNode;
      try {
        document = parse(query);
        parsingDidEnd();
      } catch (syntaxError) {
        parsingDidEnd(syntaxError);
        return sendResponse({
          errors: [
            fromGraphQLError(syntaxError, {
              errorClass: SyntaxError,
            }),
          ],
        });
      }

      const validationDidEnd = await dispatcher.validationDidStart(
        requestContext,
      );

      const validationErrors = validate(document);

      if (validationErrors.length > 0) {
        validationDidEnd(validationErrors);
        return sendResponse({
          errors: validationErrors.map(validationError =>
            fromGraphQLError(validationError, {
              errorClass: ValidationError,
            }),
          ),
        });
      }

      validationDidEnd();

      const operation = getOperationAST(document, request.operationName);

      // If we don't find an operation, we'll leave it to `buildExecutionContext`
      // in `graphql-js` to throw an appropriate error.
      if (operation && this.willExecuteOperation) {
        this.willExecuteOperation(operation);
      }

      // FIXME: If we want to guarantee an operation has been set when invoking
      // `executionDidStart`, we need to throw an error above and not leave this
      // to `buildExecutionContext` in `graphql-js`.
      requestContext.operation = operation || undefined;
      requestContext.operationName =
        (operation && operation.name && operation.name.value) || '';

      const executionDidEnd = await dispatcher.executionDidStart(
        requestContext,
      );

      let response: GraphQLResponse;

      try {
        response = (await execute(
          document,
          request.operationName,
          request.variables,
        )) as GraphQLResponse;
        executionDidEnd();
      } catch (executionError) {
        executionDidEnd(executionError);
        return sendResponse({
          errors: [fromGraphQLError(executionError)],
        });
      }

      const formattedExtensions = extensionStack.format();
      if (Object.keys(formattedExtensions).length > 0) {
        response.extensions = formattedExtensions;
      }

      if (this.config.formatResponse) {
        response = this.config.formatResponse(response, {
          context: requestContext.context,
        });
      }

      return sendResponse(response);
    } finally {
      requestDidEnd();
    }

    function parse(query: string): DocumentNode {
      const parsingDidEnd = extensionStack.parsingDidStart({
        queryString: query,
      });

      try {
        return graphql.parse(query);
      } finally {
        parsingDidEnd();
      }
    }

    function validate(document: DocumentNode): ReadonlyArray<GraphQLError> {
      let rules = specifiedRules;
      if (config.validationRules) {
        rules = rules.concat(config.validationRules);
      }

      const validationDidEnd = extensionStack.validationDidStart();

      try {
        return graphql.validate(config.schema, document, rules);
      } finally {
        validationDidEnd();
      }
    }

    async function execute(
      document: DocumentNode,
      operationName: GraphQLRequest['operationName'],
      variables: GraphQLRequest['variables'],
    ): Promise<ExecutionResult> {
      const executionArgs: ExecutionArgs = {
        schema: config.schema,
        document,
        rootValue:
          typeof config.rootValue === 'function'
            ? config.rootValue(document)
            : config.rootValue,
        contextValue: requestContext.context,
        variableValues: variables,
        operationName,
        fieldResolver: config.fieldResolver,
      };

      const executionDidEnd = extensionStack.executionDidStart({
        executionArgs,
      });

      try {
        return graphql.execute(executionArgs);
      } finally {
        executionDidEnd();
      }
    }

    async function sendResponse(
      response: GraphQLResponse,
    ): Promise<GraphQLResponse> {
      // We override errors, data, and extensions with the passed in response,
      // but keep other properties (like http)
      requestContext.response = extensionStack.willSendResponse({
        graphqlResponse: {
          ...requestContext.response,
          errors: response.errors,
          data: response.data,
          extensions: response.extensions,
        },
      }).graphqlResponse;
      await dispatcher.willSendResponse(requestContext);
      return requestContext.response!;
    }
  }

  private initializeExtensionStack(): GraphQLExtensionStack<TContext> {
    // If custom extension factories were provided, create per-request extension
    // objects.
    const extensions = this.config.extensions
      ? this.config.extensions.map(f => f())
      : [];

    if (this.config.tracing) {
      extensions.push(new TracingExtension());
    }

    let cacheControlExtension;
    if (this.config.cacheControl) {
      cacheControlExtension = new CacheControlExtension(
        this.config.cacheControl,
      );
      extensions.push(cacheControlExtension);
    }

    return new GraphQLExtensionStack(extensions);
  }

  private initializeDataSources(
    requestContext: GraphQLRequestContext<TContext>,
  ) {
    if (this.config.dataSources) {
      const context = requestContext.context;

      const dataSources = this.config.dataSources();

      for (const dataSource of Object.values(dataSources)) {
        if (dataSource.initialize) {
          dataSource.initialize({
            context,
            cache: requestContext.cache,
          });
        }
      }

      if ('dataSources' in context) {
        throw new Error(
          'Please use the dataSources config option instead of putting dataSources on the context yourself.',
        );
      }

      (context as any).dataSources = dataSources;
    }
  }
}

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T];

class Dispatcher<T> {
  constructor(protected targets: T[]) {}

  protected async invokeAsync(
    methodName: FunctionPropertyNames<Required<T>>,
    ...args: any[]
  ) {
    await Promise.all(
      this.targets.map(target => {
        const method = target[methodName];
        if (method && typeof method === 'function') {
          return method(...args);
        }
      }),
    );
  }

  protected invokeDidStart<TArgs extends any[]>(
    methodName: FunctionPropertyNames<Required<T>>,
    ...args: any[]
  ): DidEndHook<TArgs> {
    const didEndHooks: DidEndHook<TArgs>[] = [];

    for (const target of this.targets) {
      const method = target[methodName];
      if (method && typeof method === 'function') {
        const didEndHook = method(...args);
        if (didEndHook) {
          didEndHooks.push(didEndHook);
        }
      }
    }

    return (args: TArgs) => {
      didEndHooks.reverse();

      for (const didEndHook of didEndHooks) {
        didEndHook(args);
      }
    };
  }
}

// FIXME: Properly type the lifecycle hooks in the dispatcher
class GraphQLRequestListenerDispatcher<TContext>
  extends Dispatcher<GraphQLRequestListener<TContext>>
  implements Required<GraphQLRequestListener<TContext>> {
  async prepareRequest(...args: any[]) {
    return this.invokeAsync('prepareRequest', ...args);
  }

  parsingDidStart(...args: any[]): any {
    return this.invokeDidStart('parsingDidStart', ...args);
  }

  validationDidStart(...args: any[]): any {
    return this.invokeDidStart('validationDidStart', ...args);
  }

  executionDidStart(...args: any[]): any {
    return this.invokeDidStart('executionDidStart', ...args);
  }

  async willSendResponse(...args: any[]) {
    return this.invokeAsync('willSendResponse', ...args);
  }
}
