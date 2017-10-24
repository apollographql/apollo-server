import {
  GraphQLSchema,
  GraphQLObjectType,
  getNamedType,
  GraphQLField,
  defaultFieldResolver,
  GraphQLResolveInfo
} from 'graphql';

export class GraphQLExtension<TContext = any> {
  requestDidStart?(): void;

  parsingDidStart?(): void;
  parsingDidEnd?(): void;

  validationDidStart?(): void;
  validationDidEnd?(): void;

  willResolveField?(
    source: any,
    args: { [argName: string]: any },
    context: TContext,
    info: GraphQLResolveInfo
  ): ((result: any) => void) | void;

  executionDidStart?(): void;
  executionDidEnd?(): void;

  requestDidEnd?(): void;

  format?(): [string, any];
}

export class GraphQLExtensionStack<TContext = any> {
  private extensions: GraphQLExtension[];

  constructor(extensions: (typeof GraphQLExtension | GraphQLExtension)[]) {
    this.extensions = extensions.map(extension => {
      return typeof extension === 'function' ? new extension() : extension;
    });
  }

  requestDidStart(): void {
    for (const extension of this.extensions) {
      if (extension.requestDidStart) {
        extension.requestDidStart();
      }
    }
  }

  parsingDidStart() {
    for (const extension of this.extensions) {
      if (extension.requestDidStart) {
        extension.requestDidStart();
      }
    }
  }

  parsingDidEnd() {
    for (const extension of this.extensions) {
      if (extension.requestDidStart) {
        extension.requestDidStart();
      }
    }
  }

  validationDidStart() {
    for (const extension of this.extensions) {
      if (extension.requestDidStart) {
        extension.requestDidStart();
      }
    }
  }

  validationDidEnd() {
    for (const extension of this.extensions) {
      if (extension.requestDidStart) {
        extension.requestDidStart();
      }
    }
  }

  willResolveField(
    source: any,
    args: { [argName: string]: any },
    context: TContext,
    info: GraphQLResolveInfo
  ) {
    const handlers = this.extensions
      .map(extension => extension.willResolveField && extension.willResolveField(source, args, context, info))
      .filter(x => x) as ((result: any) => void)[];

    return (result: any) => {
      for (const handler of handlers) {
        handler(result);
      }
    }
  }

  executionDidStart() {
    for (const extension of this.extensions) {
      if (extension.requestDidStart) {
        extension.requestDidStart();
      }
    }
  }

  executionDidEnd() {
    for (const extension of this.extensions) {
      if (extension.executionDidEnd) {
        extension.executionDidEnd();
      }
    }
  }

  requestDidEnd() {
    for (const extension of this.extensions) {
      if (extension.requestDidEnd) {
        extension.requestDidEnd();
      }
    }
  }

  format() {
    return (this.extensions.map(extension => extension.format && extension.format()).filter(x => x) as [
      string,
      any
    ][]).reduce((extensions, [key, value]) => Object.assign(extensions, { [key]: value }), {});
  }
}

export function enableGraphQLExtensions(schema: GraphQLSchema & { _extensionsEnabled?: boolean }) {
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
    const handler = extensionStack && extensionStack.willResolveField(source, args, context, info);

    // If no resolver has been defined for a field, use the default field resolver
    // (which matches the behavior of graphql-js when there is no explicit resolve function defined).
    // TODO: Find a way to respect custom field resolvers, see https://github.com/graphql/graphql-js/pull/865
    try {
      const result = (fieldResolver || defaultFieldResolver)(source, args, context, info);
      whenResultIsFinished(result, () => {
        handler && handler(result);
      });
      return result;
    } catch (error) {
      handler && handler();
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
      if (promises.length > 0) {
        Promise.all(promises).then(callback, callback);
      } else {
        callback();
      }
    });
  } else {
    callback();
  }
}

function forEachField(schema: GraphQLSchema, fn: FieldIteratorFn): void {
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach(typeName => {
    const type = typeMap[typeName];

    if (!getNamedType(type).name.startsWith('__') && type instanceof GraphQLObjectType) {
      const fields = type.getFields();
      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        fn(field, typeName, fieldName);
      });
    }
  });
}

export type FieldIteratorFn = (fieldDef: GraphQLField<any, any>, typeName: string, fieldName: string) => void;
