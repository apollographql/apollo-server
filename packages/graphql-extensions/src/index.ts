import {
  GraphQLSchema,
  GraphQLObjectType,
  getNamedType,
  GraphQLField,
  defaultFieldResolver,
  GraphQLResolveInfo
} from 'graphql';

export interface GraphQLExtension<TContext = any> {
  willResolveField?(source: any, args: { [argName: string]: any }, context: TContext, info: GraphQLResolveInfo): void;
  format?(): [string, any];
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
    const extensions: GraphQLExtension[] = context._extensions || [];

    // If no resolver has been defined for a field, use the default field resolver
    // (which matches the behavior of graphql-js when there is no explicit resolve function defined).
    // TODO: Find a way to respect custom field resolvers, see https://github.com/graphql/graphql-js/pull/865
    try {
      for (const extension of extensions) {
        if (extension.willResolveField) {
          extension.willResolveField(source, args, context, info);
        }
      }
      const result = (fieldResolver || defaultFieldResolver)(source, args, context, info);
      return result;
    } catch (error) {
      throw error;
    }
  }
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
