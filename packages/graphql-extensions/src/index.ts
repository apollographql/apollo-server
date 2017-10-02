import {
  GraphQLSchema,
  GraphQLObjectType,
  getNamedType,
  GraphQLField,
  defaultFieldResolver,
  GraphQLResolveInfo
} from 'graphql';

export interface GraphQLExtension<TContext = any> {
  beforeField?(source: any, args: { [argName: string]: any }, context: TContext, info: GraphQLResolveInfo): void;
  afterField?(source: any, args: { [argName: string]: any }, context: TContext, info: GraphQLResolveInfo): void;
}

function forEachField(schema: GraphQLSchema, fn: IFieldIteratorFn): void {
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach(typeName => {
    const type = typeMap[typeName];

    // TODO: maybe have an option to include these?
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

export type IFieldIteratorFn = (
  fieldDef: GraphQLField<any, any>,
  typeName: string,
  fieldName: string,
) => void;

export function enableGraphQLExtensions(schema: GraphQLSchema & { __extensionsEnabled?: boolean }) {
  if (schema.__extensionsEnabled) {
    return schema;
  }
  schema.__extensionsEnabled = true;

  forEachField(schema, wrapField);

  return schema;
}

function wrapField(field: GraphQLField<any, any>): void {
  const fieldResolver = field.resolve;

  field.resolve = (source, args, context, info) => {
    const extensions: GraphQLExtension[] = context.__extensions || [];

    // If no resolver has been defined for a field, use the default field resolver
    // (which matches the behavior of graphql-js when there is no explicit resolve function defined).
    // TODO: Find a way to respect custom field resolvers, see https://github.com/graphql/graphql-js/pull/865
    try {
      for (const extension of extensions) {
        if (extension.beforeField) {
          extension.beforeField(source, args, context, info);
        }
      }
      const result = (fieldResolver || defaultFieldResolver)(source, args, context, info);
      whenResultIsFinished(result, () => {
        for (const extension of extensions) {
          if (extension.afterField) {
            extension.afterField(source, args, context, info);
          }
        }
      });
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
