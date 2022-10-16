import {
  GraphQLSchema,
  GraphQLField,
  getNamedType,
  GraphQLObjectType,
  GraphQLFieldResolver,
  defaultFieldResolver,
} from 'graphql';
import type {
  BaseContext,
  GraphQLRequestExecutionListener,
} from '../externalTypes/index.js';

export const symbolExecutionDispatcherWillResolveField = Symbol(
  'apolloServerExecutionDispatcherWillResolveField',
);
export const symbolUserFieldResolver = Symbol('apolloServerUserFieldResolver');
const symbolPluginsEnabled = Symbol('apolloServerPluginsEnabled');

export function enablePluginsForSchemaResolvers<TContext extends BaseContext>(
  schema: GraphQLSchema & { [symbolPluginsEnabled]?: boolean },
) {
  if (pluginsEnabledForSchemaResolvers(schema)) {
    return schema;
  }
  Object.defineProperty(schema, symbolPluginsEnabled, {
    value: true,
  });

  const typeMap = schema.getTypeMap();
  Object.values(typeMap).forEach((type) => {
    if (
      !getNamedType(type).name.startsWith('__') &&
      type instanceof GraphQLObjectType
    ) {
      const fields = type.getFields();
      Object.values(fields).forEach((field) => {
        wrapField<TContext>(field);
      });
    }
  });

  return schema;
}

export function pluginsEnabledForSchemaResolvers(
  schema: GraphQLSchema & { [symbolPluginsEnabled]?: boolean },
): boolean {
  return !!schema[symbolPluginsEnabled];
}

function wrapField<TContext extends BaseContext>(
  field: GraphQLField<any, any>,
): void {
  const originalFieldResolve = field.resolve;

  field.resolve = (source, args, contextValue, info) => {
    const willResolveField = contextValue?.[
      symbolExecutionDispatcherWillResolveField
    ] as
      | GraphQLRequestExecutionListener<TContext>['willResolveField']
      | undefined;

    const userFieldResolver = contextValue?.[symbolUserFieldResolver] as
      | GraphQLFieldResolver<any, any>
      | undefined;

    // The technique for implementing a  "did resolve field" is accomplished by
    // returning a function from the `willResolveField` handler.  While there
    // may be several callbacks, depending on the number of plugins which have
    // implemented a `willResolveField` hook, this hook will call them all
    // as dictated by the dispatcher.  We will call this when object
    // resolution is complete.
    const didResolveField =
      typeof willResolveField === 'function' &&
      willResolveField({ source, args, contextValue, info });

    const fieldResolver =
      originalFieldResolve || userFieldResolver || defaultFieldResolver;

    try {
      const result = fieldResolver(source, args, contextValue, info);

      // Call the stack's handlers either immediately (if result is not a
      // Promise) or once the Promise is done. Then return that same
      // maybe-Promise value.
      if (typeof didResolveField === 'function') {
        whenResultIsFinished(result, didResolveField);
      }
      return result;
    } catch (error) {
      // Normally it's a bad sign to see an error both handled and
      // re-thrown. But it is useful to allow extensions to track errors while
      // still handling them in the normal GraphQL way.
      if (typeof didResolveField === 'function') {
        didResolveField(error as Error);
      }
      throw error;
    }
  };
}

function isPromise(x: any): boolean {
  return x && typeof x.then === 'function';
}

// Given result (which may be a Promise or an array some of whose elements are
// promises) Promises, set up 'callback' to be invoked when result is fully
// resolved.
export function whenResultIsFinished(
  result: any,
  callback: (err: Error | null, result?: any) => void,
) {
  if (isPromise(result)) {
    result.then(
      (r: any) => callback(null, r),
      (err: Error) => callback(err),
    );
  } else if (Array.isArray(result)) {
    if (result.some(isPromise)) {
      Promise.all(result).then(
        (r: any) => callback(null, r),
        (err: Error) => callback(err),
      );
    } else {
      callback(null, result);
    }
  } else {
    callback(null, result);
  }
}
