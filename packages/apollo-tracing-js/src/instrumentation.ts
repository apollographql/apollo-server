import { 
    GraphQLSchema,
    GraphQLType,
    getNamedType,
    GraphQLObjectType,
    GraphQLField,
    GraphQLFieldResolver,
    defaultFieldResolver,
    ResponsePath,
    responsePathAsArray
} from 'graphql';

import {
  forEachField,
  addSchemaLevelResolveFunction
} from 'graphql-tools'

export type HighResolutionTime = [number, number]

export class TraceCollector {
  startWallTime: Date;
  endWallTime: Date;
  startHrTime: HighResolutionTime;
  duration: HighResolutionTime;

  resolverCalls: ResolverCall[];

  constructor() {
    this.resolverCalls = [];
  }

  requestDidStart() {
    this.startWallTime = new Date();
    this.startHrTime = process.hrtime();
  }

  executionDidStart() {
  }

  requestDidEnd() {
    this.duration = process.hrtime(this.startHrTime);
    this.endWallTime = new Date();
  }
}

export interface ResolverCall {
  path: ResponsePath;
  fieldName: string,
  parentType: GraphQLType,
  returnType: GraphQLType,
  startOffset: HighResolutionTime;
  endOffset?: HighResolutionTime;
}

export function instrumentSchemaForTracing(schema: GraphQLSchema & { _instrumentedForTracing?: boolean }) {
  if (schema._instrumentedForTracing) {
    return schema;
  }
  schema._instrumentedForTracing = true;

  forEachField(schema, instrumentField);

  /*
  addSchemaLevelResolveFunction(schema, (source, args, context, info) => {
    const TraceCollector = new TraceCollector();
    context._TraceCollector = TraceCollector;
    TraceCollector.executionDidStart();
    return source;
  });
  */
}

function instrumentField(field: GraphQLField<any, any>): void {
  const fieldResolver = field.resolve;

  const instrumentedFieldResolver: GraphQLFieldResolver<any, any> = (source, args, context, info) => {
    const traceCollector = context._traceCollector;

    const resolverCall: ResolverCall = {
      path: info.path,
      fieldName: info.fieldName,
      parentType: info.parentType,
      returnType: info.returnType,
      startOffset: process.hrtime(traceCollector.startHrTime)
    };

    function resolverCallDidFinish() {
      resolverCall.endOffset = process.hrtime(traceCollector.startHrTime)
    }

    traceCollector.resolverCalls.push(resolverCall);

    // If no resolver has been defined for a field, use the default field resolver
    // (which matches the behavior of graphql-js when there is no explicit resolve function defined).
    // TODO: Find a way to respect custom field resolvers, see https://github.com/graphql/graphql-js/pull/865
    try {
      const result = (fieldResolver || defaultFieldResolver)(source, args, context, info);
      whenResultIsFinished(result, resolverCallDidFinish);
      return result;
    } catch (error) {
      resolverCallDidFinish();
      throw error;
    }
  }

  field.resolve = instrumentedFieldResolver;
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
