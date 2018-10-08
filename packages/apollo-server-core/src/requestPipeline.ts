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
  GraphQLRequestListener,
  ApolloServerPlugin,
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

    const extensionStack = this.initializeExtensionStack();
    (requestContext.context as any)._extensionStack = extensionStack;

    this.initializeDataSources(requestContext);

    await Promise.all(
      requestListeners.map(
        listener =>
          listener.prepareRequest && listener.prepareRequest(requestContext),
      ),
    );

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

    try {
      let document: DocumentNode;
      try {
        document = parse(query);
      } catch (syntaxError) {
        return sendResponse({
          errors: [
            fromGraphQLError(syntaxError, {
              errorClass: SyntaxError,
            }),
          ],
        });
      }

      const validationErrors = validate(document);

      if (validationErrors.length > 0) {
        return sendResponse({
          errors: validationErrors.map(validationError =>
            fromGraphQLError(validationError, {
              errorClass: ValidationError,
            }),
          ),
        });
      }

      const operation = getOperationAST(document, request.operationName);

      // If we don't find an operation, we'll leave it to `buildExecutionContext`
      // in `graphql-js` to throw an appropriate error.
      if (operation && this.willExecuteOperation) {
        this.willExecuteOperation(operation);
      }

      // FIXME: If we want to guarantee an operation has been set when invoking
      // `executionDidStart`, we need to throw an error above and not leave this
      // to `buildExecutionContext` in `graphql-js`.
      requestContext.operation = operation as OperationDefinitionNode;

      requestListeners.forEach(
        listener =>
          listener.executionDidStart &&
          listener.executionDidStart(requestContext),
      );

      let response: GraphQLResponse;

      try {
        response = (await execute(
          document,
          request.operationName,
          request.variables,
        )) as GraphQLResponse;
      } catch (executionError) {
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

    function sendResponse(response: GraphQLResponse): GraphQLResponse {
      // We override errors, data, and extensions with the passed in response,
      // but keep other properties (like http)
      return (requestContext.response = extensionStack.willSendResponse({
        graphqlResponse: {
          ...requestContext.response,
          errors: response.errors,
          data: response.data,
          extensions: response.extensions,
        },
      }).graphqlResponse);
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
