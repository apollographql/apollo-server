import { Request } from 'apollo-server-env';
import {
  GraphQLSchema,
  GraphQLFieldResolver,
  ValidationContext,
  ASTVisitor,
  DocumentNode,
  parse,
  specifiedRules,
  validate,
  GraphQLError,
  ExecutionArgs,
  ExecutionResult,
  execute,
  getOperationAST,
  OperationDefinitionNode,
} from 'graphql';
import {
  GraphQLExtension,
  GraphQLExtensionStack,
  enableGraphQLExtensions,
} from 'graphql-extensions';
import { PersistedQueryOptions } from './';
import {
  CacheControlExtension,
  CacheControlExtensionOptions,
} from 'apollo-cache-control';
import { TracingExtension } from 'apollo-tracing';
import {
  fromGraphQLError,
  SyntaxError,
  ValidationError,
} from 'apollo-server-errors';

export interface GraphQLRequest {
  query?: string;
  operationName?: string;
  variables?: { [name: string]: any };
  extensions?: object;
  httpRequest?: Pick<Request, 'url' | 'method' | 'headers'>;
}

export interface GraphQLRequestOptions<TContext = any> {
  schema: GraphQLSchema;

  rootValue?: any;
  context: TContext;

  validationRules?: ValidationRule[];
  fieldResolver?: GraphQLFieldResolver<any, TContext>;

  debug?: boolean;

  extensions?: Array<() => GraphQLExtension>;
  tracing?: boolean;
  persistedQueries?: PersistedQueryOptions;
  cacheControl?: CacheControlExtensionOptions;

  formatResponse?: Function;
}

export type ValidationRule = (context: ValidationContext) => ASTVisitor;

export class InvalidGraphQLRequestError extends Error {}

export interface GraphQLResponse {
  data?: object;
  errors?: GraphQLError[];
  extensions?: object;
}

export interface GraphQLRequestProcessor {
  willExecuteOperation?(operation: OperationDefinitionNode): void;
}

export class GraphQLRequestProcessor {
  extensionStack!: GraphQLExtensionStack;

  constructor(public options: GraphQLRequestOptions) {
    this.initializeExtensions();
  }

  initializeExtensions() {
    // If custom extension factories were provided, create per-request extension
    // objects.
    const extensions = this.options.extensions
      ? this.options.extensions.map(f => f())
      : [];

    // If you're running behind an engineproxy, set these options to turn on
    // tracing and cache-control extensions.
    if (this.options.tracing) {
      extensions.push(new TracingExtension());
    }
    if (this.options.cacheControl === true) {
      extensions.push(new CacheControlExtension());
    } else if (this.options.cacheControl) {
      extensions.push(new CacheControlExtension(this.options.cacheControl));
    }

    this.extensionStack = new GraphQLExtensionStack(extensions);

    // We unconditionally create an extensionStack, even if there are no
    // extensions (so that we don't have to litter the rest of this function with
    // `if (extensionStack)`, but we don't instrument the schema unless there
    // actually are extensions.  We do unconditionally put the stack on the
    // context, because if some other call had extensions and the schema is
    // already instrumented, that's the only way to get a custom fieldResolver to
    // work.
    if (extensions.length > 0) {
      enableGraphQLExtensions(this.options.schema);
    }
    this.options.context._extensionStack = this.extensionStack;
  }

  async processRequest(request: GraphQLRequest): Promise<GraphQLResponse> {
    if (!request.query) {
      throw new InvalidGraphQLRequestError();
    }

    const requestDidEnd = this.extensionStack.requestDidStart({
      request: request.httpRequest!,
      queryString: request.query,
      operationName: request.operationName,
      variables: request.variables,
      persistedQueryHit: false,
      persistedQueryRegister: false,
    });

    try {
      let document: DocumentNode;
      try {
        document = this.parse(request.query);
      } catch (syntaxError) {
        return this.willSendResponse({
          errors: [
            fromGraphQLError(syntaxError, {
              errorClass: SyntaxError,
            }),
          ],
        });
      }

      const validationErrors = this.validate(document);

      if (validationErrors.length > 0) {
        return this.willSendResponse({
          errors: validationErrors.map(validationError =>
            fromGraphQLError(validationError, {
              errorClass: ValidationError,
            }),
          ),
        });
      }

      const operation = getOperationAST(document, request.operationName);
      // If we don't find an operation, we'll leave it to `buildExecutionContext`
      // to throw an appropriate error.
      if (operation && this.willExecuteOperation) {
        this.willExecuteOperation(operation);
      }

      let response: GraphQLResponse;

      try {
        response = (await this.execute(
          document,
          request.operationName,
          request.variables,
        )) as GraphQLResponse;
      } catch (executionError) {
        return this.willSendResponse({
          errors: [fromGraphQLError(executionError)],
        });
      }

      const formattedExtensions = this.extensionStack.format();
      if (Object.keys(formattedExtensions).length > 0) {
        response.extensions = formattedExtensions;
      }

      if (this.options.formatResponse) {
        response = this.options.formatResponse(response);
      }

      return this.willSendResponse(response);
    } finally {
      requestDidEnd();
    }
  }

  private willSendResponse(response: GraphQLResponse): GraphQLResponse {
    return this.extensionStack.willSendResponse({
      graphqlResponse: response,
    }).graphqlResponse;
  }

  parse(query: string): DocumentNode {
    const parsingDidEnd = this.extensionStack.parsingDidStart({
      queryString: query,
    });

    try {
      return parse(query);
    } finally {
      parsingDidEnd();
    }
  }

  validate(document: DocumentNode): ReadonlyArray<GraphQLError> {
    let rules = specifiedRules;
    if (this.options.validationRules) {
      rules = rules.concat(this.options.validationRules);
    }

    const validationDidEnd = this.extensionStack.validationDidStart();

    try {
      return validate(this.options.schema, document, rules);
    } finally {
      validationDidEnd();
    }
  }

  async execute(
    document: DocumentNode,
    operationName: GraphQLRequest['operationName'],
    variables: GraphQLRequest['variables'],
  ): Promise<ExecutionResult> {
    const executionArgs: ExecutionArgs = {
      schema: this.options.schema,
      document,
      rootValue: this.options.rootValue,
      contextValue: this.options.context,
      variableValues: variables,
      operationName,
      fieldResolver: this.options.fieldResolver,
    };

    const executionDidEnd = this.extensionStack.executionDidStart({
      executionArgs,
    });

    try {
      return execute(executionArgs);
    } finally {
      executionDidEnd();
    }
  }
}
