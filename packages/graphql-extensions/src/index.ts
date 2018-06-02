import {
  GraphQLSchema,
  GraphQLError,
  GraphQLObjectType,
  getNamedType,
  GraphQLField,
  defaultFieldResolver,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
  ExecutionArgs,
  DocumentNode,
} from 'graphql';

export type EndHandler = (...errors: Array<Error>) => void;
// A StartHandlerInvoker is a function that, given a specific GraphQLExtension,
// finds a specific StartHandler on that extension and calls it with appropriate
// arguments.
type StartHandlerInvoker<TContext = any> = (
  ext: GraphQLExtension<TContext>,
) => void;

// Copied from runQuery in apollo-server-core.
// XXX Will this work properly if it's an identical interface of the
// same name?
export interface GraphQLResponse {
  data?: object;
  errors?: Array<GraphQLError & object>;
  extensions?: object;
}

export class GraphQLExtension<TContext = any> {
  public requestDidStart?(o: {
    request: Request;
    queryString?: string;
    parsedQuery?: DocumentNode;
    operationName?: string;
    variables?: { [key: string]: any };
  }): EndHandler | void;
  public parsingDidStart?(o: { queryString: string }): EndHandler | void;
  public validationDidStart?(): EndHandler | void;
  public executionDidStart?(o: {
    executionArgs: ExecutionArgs;
  }): EndHandler | void;

  public willSendResponse?(o: { graphqlResponse: GraphQLResponse }): void;

  public willResolveField?(
    source: any,
    args: { [argName: string]: any },
    context: TContext,
    info: GraphQLResolveInfo,
  ): ((result: any) => void) | void;

  public format?(): [string, any] | undefined;
}

export class GraphQLExtensionStack<TContext = any> {
  public fieldResolver?: GraphQLFieldResolver<any, any>;

  private extensions: GraphQLExtension<TContext>[];

  constructor(extensions: GraphQLExtension<TContext>[]) {
    this.extensions = extensions;
  }

  public requestDidStart(o: {
    request: Request;
    queryString?: string;
    parsedQuery?: DocumentNode;
    operationName?: string;
    variables?: { [key: string]: any };
  }): EndHandler {
    return this.handleDidStart(
      ext => ext.requestDidStart && ext.requestDidStart(o),
    );
  }
  public parsingDidStart(o: { queryString: string }): EndHandler {
    return this.handleDidStart(
      ext => ext.parsingDidStart && ext.parsingDidStart(o),
    );
  }
  public validationDidStart(): EndHandler {
    return this.handleDidStart(
      ext => ext.validationDidStart && ext.validationDidStart(),
    );
  }
  public executionDidStart(o: { executionArgs: ExecutionArgs }): EndHandler {
    if (o.executionArgs.fieldResolver) {
      this.fieldResolver = o.executionArgs.fieldResolver;
    }
    return this.handleDidStart(
      ext => ext.executionDidStart && ext.executionDidStart(o),
    );
  }

  public willSendResponse(o: { graphqlResponse: GraphQLResponse }): void {
    this.extensions.forEach(extension => {
      if (extension.willSendResponse) {
        extension.willSendResponse(o);
      }
    });
  }

  public willResolveField(
    source: any,
    args: { [argName: string]: any },
    context: TContext,
    info: GraphQLResolveInfo,
  ) {
    const handlers = this.extensions
      .map(
        extension =>
          extension.willResolveField &&
          extension.willResolveField(source, args, context, info),
      )
      .filter(x => x)
      // Reverse list so that handlers "nest", like in handleDidStart.
      .reverse() as ((result: any) => void)[];

    return (result: any) => {
      for (const handler of handlers) {
        handler(result);
      }
    };
  }

  public format() {
    return (this.extensions
      .map(extension => extension.format && extension.format())
      .filter(x => x) as [string, any][]).reduce(
      (extensions, [key, value]) => Object.assign(extensions, { [key]: value }),
      {},
    );
  }

  private handleDidStart(startInvoker: StartHandlerInvoker): EndHandler {
    const endHandlers: EndHandler[] = [];
    this.extensions.forEach(extension => {
      // Invoke the start handler, which may return an end handler.
      const endHandler = startInvoker(extension);
      if (endHandler) {
        endHandlers.push(endHandler);
      }
    });
    return (...errors: Array<Error>) => {
      // We run end handlers in reverse order of start handlers. That way, the
      // first handler in the stack "surrounds" the entire event's process
      // (helpful for tracing/reporting!)
      endHandlers.reverse();
      endHandlers.forEach(endHandler => endHandler(...errors));
    };
  }
}

export function enableGraphQLExtensions(
  schema: GraphQLSchema & { _extensionsEnabled?: boolean },
) {
  if (schema._extensionsEnabled) {
    return schema;
  }
  schema._extensionsEnabled = true;

  forEachField(schema, wrapField);

  return schema;
}

function wrapField(field: GraphQLField<any, any>): void {
  const fieldResolver = field.resolve;

  field.resolve = (source, args, context, info) => {
    const extensionStack = context && context._extensionStack;
    const handler =
      extensionStack &&
      extensionStack.willResolveField(source, args, context, info);

    // If no resolver has been defined for a field, use the default field resolver
    // (which matches the behavior of graphql-js when there is no explicit resolve function defined).
    // TODO: Find a way to respect custom field resolvers, see https://github.com/graphql/graphql-js/pull/865
    try {
      const result = (fieldResolver ||
        extensionStack.fieldResolver ||
        defaultFieldResolver)(source, args, context, info);
      whenResultIsFinished(result, () => {
        if (handler) handler(result);
      });
      return result;
    } catch (error) {
      if (handler) handler();
      throw error;
    }
  };
}

function whenResultIsFinished(result: any, callback: () => void) {
  if (result === null || typeof result === 'undefined') {
    callback();
  } else if (typeof result.then === 'function') {
    result.then(callback, callback);
  } else if (Array.isArray(result)) {
    const promises: Promise<any>[] = [];
    result.forEach(value => {
      if (value && typeof value.then === 'function') {
        promises.push(value);
      }
    });
    if (promises.length > 0) {
      Promise.all(promises).then(callback, callback);
    } else {
      callback();
    }
  } else {
    callback();
  }
}

function forEachField(schema: GraphQLSchema, fn: FieldIteratorFn): void {
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach(typeName => {
    const type = typeMap[typeName];

    if (
      !getNamedType(type).name.startsWith('__') &&
      type instanceof GraphQLObjectType
    ) {
      const fields = type.getFields();
      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        fn(field, typeName, fieldName);
      });
    }
  });
}

export type FieldIteratorFn = (
  fieldDef: GraphQLField<any, any>,
  typeName: string,
  fieldName: string,
) => void;
