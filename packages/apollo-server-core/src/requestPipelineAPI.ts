import {
  GraphQLField,
  getNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  ResponsePath,
} from 'graphql/type';
import { defaultFieldResolver } from "graphql/execution";
import { FieldNode } from "graphql/language";
import { Dispatcher } from "./utils/dispatcher";
import { GraphQLRequestListener } from "apollo-server-plugin-base";
import { GraphQLObjectResolver } from "@apollographql/apollo-tools";

export {
  GraphQLServiceContext,
  GraphQLRequest,
  VariableValues,
  GraphQLResponse,
  GraphQLRequestMetrics,
  GraphQLRequestContext,
  ValidationRule,
  InvalidGraphQLRequestError,
  GraphQLExecutor,
  GraphQLExecutionResult,
} from 'apollo-server-types';

export const symbolRequestListenerDispatcher =
  Symbol("apolloServerRequestListenerDispatcher");
export const symbolPluginsEnabled = Symbol("apolloServerPluginsEnabled");

export function enablePluginsForSchemaResolvers(
  schema: GraphQLSchema & { [symbolPluginsEnabled]?: boolean },
) {
  if (schema[symbolPluginsEnabled]) {
    return schema;
  }
  Object.defineProperty(schema, symbolPluginsEnabled, {
    value: true,
  });

  forEachField(schema, wrapField);

  return schema;
}

function wrapField(field: GraphQLField<any, any>): void {
  const fieldResolver = field.resolve || defaultFieldResolver;

  field.resolve = (source, args, context, info) => {
    // This is a bit of a hack, but since `ResponsePath` is a linked list,
    // a new object gets created every time a path segment is added.
    // So we can use that to share our `whenObjectResolved` promise across
    // all field resolvers for the same object.
    const parentPath = info.path.prev as ResponsePath & {
      __fields?: Record<string, ReadonlyArray<FieldNode>>;
      __whenObjectResolved?: Promise<any>;
    };

    // The technique for implementing a  "did resolve field" is accomplished by
    // returning a function from the `willResolveField` handler.  The
    // dispatcher will return a callback which will invoke all of those handlers
    // and we'll save that to call when the object resolution is complete.
    const endHandler = context && context[symbolRequestListenerDispatcher] &&
      (context[symbolRequestListenerDispatcher] as Dispatcher<GraphQLRequestListener>)
        .invokeDidStartHook('willResolveField', source, args, context, info) ||
          ((_err: Error | null, _result?: any) => { /* do nothing */ });

    const resolveObject: GraphQLObjectResolver<
      any,
      any
    > = (info.parentType as any).resolveObject;

    let whenObjectResolved: Promise<any> | undefined;

    if (parentPath && resolveObject) {
      if (!parentPath.__fields) {
        parentPath.__fields = {};
      }

      parentPath.__fields[info.fieldName] = info.fieldNodes;

      whenObjectResolved = parentPath.__whenObjectResolved;
      if (!whenObjectResolved) {
        // Use `Promise.resolve().then()` to delay executing
        // `resolveObject()` so we can collect all the fields first.
        whenObjectResolved = Promise.resolve().then(() => {
          return resolveObject(source, parentPath.__fields!, context, info);
        });
        parentPath.__whenObjectResolved = whenObjectResolved;
      }
    }

    try {
      let result: any;
      if (whenObjectResolved) {
        result = whenObjectResolved.then((resolvedObject: any) => {
          return fieldResolver(resolvedObject, args, context, info);
        });
      } else {
        result = fieldResolver(source, args, context, info);
      }

      // Call the stack's handlers either immediately (if result is not a
      // Promise) or once the Promise is done. Then return that same
      // maybe-Promise value.
      whenResultIsFinished(result, endHandler);
      return result;
    } catch (error) {
      // Normally it's a bad sign to see an error both handled and
      // re-thrown. But it is useful to allow extensions to track errors while
      // still handling them in the normal GraphQL way.
      endHandler(error);
      throw error;
    }
  };;
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
    result.then((r: any) => callback(null, r), (err: Error) => callback(err));
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

function forEachField(schema: GraphQLSchema, fn: FieldIteratorFn): void {
  const typeMap = schema.getTypeMap();
  Object.entries(typeMap).forEach(([typeName, type]) => {

    if (
      !getNamedType(type).name.startsWith('__') &&
      type instanceof GraphQLObjectType
    ) {
      const fields = type.getFields();
      Object.entries(fields).forEach(([fieldName, field]) => {
        fn(field, typeName, fieldName);
      });
    }
  });
}

type FieldIteratorFn = (
  fieldDef: GraphQLField<any, any>,
  typeName: string,
  fieldName: string,
) => void;
