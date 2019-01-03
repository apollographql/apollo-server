/**
 * Adding @defer Support
 * The execution phase has been modified to enable @defer support, with
 * changes starting from `executeOperation()`. Utility functions are
 * exported from `graphql.js` where possible.
 *
 * Within `completeValueCatchingError()`, we check if the current field should
 * be deferred. If it is, `null` is returned to its parent instead of a promise
 * for the field. The promise is then queued to be sent as a patch once it
 * resolves.
 *
 * Deferred fields are returned to the caller in the form of an
 * AsyncIterable<ExecutionPatchResult>. AsyncIterables are supported natively
 * in Node 10, otherwise the 'iterall' package provides support for all
 * versions.
 */

import { $$asyncIterator, forEach, isCollection } from 'iterall';
import { GraphQLError, locatedError } from 'graphql/error';
import invariant from 'graphql/jsutils/invariant';
import isInvalid from 'graphql/jsutils/isInvalid';
import isNullish from 'graphql/jsutils/isNullish';
import memoize3 from 'graphql/jsutils/memoize3';
import promiseForObject from 'graphql/jsutils/promiseForObject';
import promiseReduce from 'graphql/jsutils/promiseReduce';
import { getDirectiveValues } from 'graphql/execution/values';
import {
  isObjectType,
  isAbstractType,
  isLeafType,
  isListType,
  isNonNullType,
  GraphQLType,
} from 'graphql/type/definition';
import {
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLLeafType,
  GraphQLAbstractType,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
  ResponsePath,
  GraphQLList,
} from 'graphql/type/definition';
import { GraphQLSchema } from 'graphql/type/schema';
import {
  DocumentNode,
  OperationDefinitionNode,
  FieldNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  FragmentDefinitionNode,
  VariableDefinitionNode,
} from 'graphql/language/ast';
import {
  ExecutionResult,
  responsePathAsArray,
  addPath,
  assertValidExecutionArguments,
  collectFields,
  buildResolveInfo,
  resolveFieldValueOrError,
  getFieldDef,
  defaultFieldResolver,
} from 'graphql/execution/execute';
import { getVariableValues } from 'graphql/execution/values';
import GraphQLDeferDirective from './GraphQLDeferDirective';
import Maybe from 'graphql/tsutils/Maybe';
import { Kind } from 'graphql';

/**
 * Rewrite flow types in typescript
 */
export type MaybePromise<T> = Promise<T> | T;

export type ExecutionArgs = {
  schema: GraphQLSchema;
  document: DocumentNode;
  rootValue?: any;
  contextValue?: any;
  variableValues?: Maybe<{ [key: string]: any }>;
  operationName?: Maybe<string>;
  fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
  enableDefer?: boolean;
};

function isPromise(
  maybePromise: MaybePromise<any>,
): maybePromise is Promise<any> {
  return maybePromise && typeof maybePromise.then === 'function';
}

// Valid types a GraphQL field can take
type FieldValue =
  | Record<string, {}>
  | Array<any>
  | string
  | number
  | boolean
  | null;

type PatchBundle = Promise<{
  patch: ExecutionPatchResult;
  dependentPatches?: PatchBundle[];
}>;

/**
 * Data that must be available at all points during query execution.
 *
 * Namely, schema of the type system that is currently executing,
 * and the fragments defined in the query document.
 *
 * To enable defer support, the ExecutionContext is also used to store
 * promises to patches, and deferred errors.
 */
export type ExecutionContext = {
  schema: GraphQLSchema;
  fragments: Record<string, FragmentDefinitionNode>;
  rootValue: {};
  contextValue: {};
  operation: OperationDefinitionNode;
  variableValues: { [variable: string]: {} };
  fieldResolver: GraphQLFieldResolver<any, any>;
  errors: GraphQLError[];
  enableDefer?: boolean;
  patchDispatcher?: PatchDispatcher;
  deferredDependents?: Record<
    string,
    {
      patches: PatchBundle[];
      errors: GraphQLError[];
    }
  >;
};

export function buildExecutionContext(
  schema: GraphQLSchema,
  document: DocumentNode,
  rootValue: {},
  contextValue: {},
  rawVariableValues: Record<string, {}> | null,
  operationName: string | null,
  fieldResolver: GraphQLFieldResolver<any, any> | null,
  enableDefer?: boolean,
): GraphQLError[] | ExecutionContext {
  const errors: Array<GraphQLError> = [];
  let operation: OperationDefinitionNode | undefined;
  let hasMultipleAssumedOperations = false;
  const fragments: Record<string, FragmentDefinitionNode> = Object.create(null);
  for (let i = 0; i < document.definitions.length; i++) {
    const definition = document.definitions[i];
    switch (definition.kind) {
      case Kind.OPERATION_DEFINITION:
        if (!operationName && operation) {
          hasMultipleAssumedOperations = true;
        } else if (
          !operationName ||
          (definition.name && definition.name.value === operationName)
        ) {
          operation = definition;
        }
        break;
      case Kind.FRAGMENT_DEFINITION:
        fragments[definition.name.value] = definition;
        break;
    }
  }

  if (!operation) {
    if (operationName) {
      errors.push(
        new GraphQLError(`Unknown operation named "${operationName}".`),
      );
    } else {
      errors.push(new GraphQLError('Must provide an operation.'));
    }
  } else if (hasMultipleAssumedOperations) {
    errors.push(
      new GraphQLError(
        'Must provide operation name if query contains ' +
          'multiple operations.',
      ),
    );
  }

  let variableValues;
  if (operation) {
    const coercedVariableValues = getVariableValues(
      schema,
      (operation.variableDefinitions as VariableDefinitionNode[]) || [],
      rawVariableValues || {},
    );

    if (coercedVariableValues.errors) {
      errors.push(...coercedVariableValues.errors);
    } else {
      variableValues = coercedVariableValues.coerced;
    }
  }

  if (errors.length !== 0) {
    return errors;
  }

  invariant(operation, 'Has operation if no errors.');
  invariant(variableValues, 'Has variables if no errors.');

  return {
    schema,
    fragments,
    rootValue,
    contextValue,
    operation: operation as OperationDefinitionNode,
    variableValues,
    fieldResolver: fieldResolver || defaultFieldResolver,
    errors,
    enableDefer,
  };
}

/**
 * Determines if a field should be deferred. @skip and @include has higher
 * precedence than @defer.
 */
function shouldDeferNode(
  exeContext: ExecutionContext,
  node: FragmentSpreadNode | FieldNode | InlineFragmentNode,
): boolean {
  if (!exeContext.enableDefer) {
    return false;
  }
  const defer = getDirectiveValues(
    GraphQLDeferDirective,
    node,
    exeContext.variableValues,
  );
  return defer !== undefined ? !defer.if : false; // default value for "if" is true
}

/**
 * Define a new type for patches that are sent as a result of using defer.
 * Its is basically the same as ExecutionResult, except that it has a "path"
 * field that keeps track of the where the patch is to be merged with the
 * original result.
 */
export interface ExecutionPatchResult {
  data?: FieldValue;
  errors?: ReadonlyArray<GraphQLError>;
  path: ReadonlyArray<string | number>;
}

/**
 * Define a return type from execute() that is a wraps over the initial
 * result that is returned from a deferred query. Alongside the initial
 * response, an array of promises to the deferred patches is returned.
 */
export interface DeferredExecutionResult {
  initialResult: ExecutionResult;
  deferredPatches: AsyncIterable<ExecutionPatchResult>;
}

/**
 * Type guard for DeferredExecutionResult
 */
export function isDeferredExecutionResult(
  result: any,
): result is DeferredExecutionResult {
  return (
    (<DeferredExecutionResult>result).initialResult !== undefined &&
    (<DeferredExecutionResult>result).deferredPatches !== undefined
  );
}

/**
 * Build a ExecutionPatchResult from supplied arguments
 */
function formatDataAsPatch(
  path: ResponsePath,
  data: FieldValue,
  errors: ReadonlyArray<GraphQLError>,
): ExecutionPatchResult {
  return {
    path: responsePathAsArray(path),
    data,
    errors: errors && errors.length > 0 ? errors : undefined,
  };
}

/**
 * Utlity functions to store patches or errors that should be returned with
 * its parent. These patches/errors are added here by child nodes, and retrieved
 * by the parent.
 */
function initializeDependentStore(
  exeContext: ExecutionContext,
  parentPath: string,
) {
  if (!exeContext.deferredDependents) {
    exeContext.deferredDependents = {};
  }
  if (!exeContext.deferredDependents[parentPath]) {
    exeContext.deferredDependents[parentPath] = {
      errors: [] as GraphQLError[],
      patches: [] as PatchBundle[],
    };
  }
}

function deferErrorToParent(
  exeContext: ExecutionContext,
  parentPath: string,
  error: GraphQLError,
) {
  initializeDependentStore(exeContext, parentPath);
  exeContext.deferredDependents![parentPath].errors.push(error);
}

function deferPatchToParent(
  exeContext: ExecutionContext,
  parentPath: string,
  patch: PatchBundle,
) {
  initializeDependentStore(exeContext, parentPath);
  exeContext.deferredDependents![parentPath].patches.push(patch);
}

/**
 * Calls dispatch on the PatchDispatcher, creating it if it is not already
 * instantiated.
 */
function dispatchPatch(exeContext: ExecutionContext, patch: PatchBundle): void {
  if (!exeContext.patchDispatcher) {
    exeContext.patchDispatcher = new PatchDispatcher();
  }
  exeContext.patchDispatcher.dispatch(patch);
}

/**
 * Helper class that allows us to dispatch patches dynamically, and obtain an
 * AsyncIterable that yields each patch in the order that they get resolved.
 */
class PatchDispatcher {
  private resolvers: ((
    { value, done }: { value: ExecutionPatchResult; done: boolean },
  ) => void)[] = [];

  private resultPromises: Promise<{
    value: ExecutionPatchResult;
    done: boolean;
  }>[] = [];

  public dispatch(patch: PatchBundle): void {
    patch.then(({ patch, dependentPatches }) => {
      // Queue patches for dependent fields before resolving parent
      if (dependentPatches) {
        for (const patch of dependentPatches) {
          this.dispatch(patch);
        }
      }
      const resolver = this.resolvers.shift();
      if (resolver) resolver({ value: patch, done: false });
    });
    this.resultPromises.push(
      new Promise<{ value: ExecutionPatchResult; done: boolean }>(resolve => {
        this.resolvers.push(resolve);
      }),
    );
  }

  public getAsyncIterable(): AsyncIterable<ExecutionPatchResult> {
    const self = this;
    return {
      [$$asyncIterator]() {
        return {
          next() {
            return (
              self.resultPromises.shift() || Promise.resolve({ done: true })
            );
          },
        };
      },
    } as any; // Typescript does not handle $$asyncIterator correctly
  }
}

/**
 * Unchanged
 */
export function execute(
  ExecutionArgs: ExecutionArgs,
  ..._: any[]
): MaybePromise<ExecutionResult | DeferredExecutionResult>;
/* eslint-disable no-redeclare */
export function execute(
  schema: GraphQLSchema,
  document: DocumentNode,
  rootValue?: {},
  contextValue?: {},
  variableValues?: { [variable: string]: {} },
  operationName?: string,
  fieldResolver?: GraphQLFieldResolver<any, any>,
  enableDefer?: boolean,
): MaybePromise<ExecutionResult | DeferredExecutionResult>;
export function execute(
  argsOrSchema,
  document,
  rootValue,
  contextValue,
  variableValues,
  operationName,
  fieldResolver,
  enableDefer,
): MaybePromise<ExecutionResult | DeferredExecutionResult> {
  /* eslint-enable no-redeclare */
  // Extract arguments from object args if provided.
  return arguments.length === 1
    ? executeImpl(
        argsOrSchema.schema,
        argsOrSchema.document,
        argsOrSchema.rootValue,
        argsOrSchema.contextValue,
        argsOrSchema.variableValues,
        argsOrSchema.operationName,
        argsOrSchema.fieldResolver,
        argsOrSchema.enableDefer,
      )
    : executeImpl(
        argsOrSchema,
        document,
        rootValue,
        contextValue,
        variableValues,
        operationName,
        fieldResolver,
        enableDefer,
      );
}

/**
 * Unchanged
 */
function executeImpl(
  schema,
  document,
  rootValue,
  contextValue,
  variableValues,
  operationName,
  fieldResolver,
  enableDefer,
): MaybePromise<ExecutionResult | DeferredExecutionResult> {
  // If arguments are missing or incorrect, throw an error.
  assertValidExecutionArguments(schema, document, variableValues);

  // If a valid context cannot be created due to incorrect arguments,
  // a "Response" with only errors is returned.
  const context = buildExecutionContext(
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver,
    enableDefer,
  );

  // Return early errors if execution context failed.
  if (Array.isArray(context)) {
    return { errors: context };
  }

  // Return a Promise that will eventually resolve to the data described by
  // The "Response" section of the GraphQL specification.
  //
  // If errors are encountered while executing a GraphQL field, only that
  // field and its descendants will be omitted, and sibling fields will still
  // be executed. An execution which encounters errors will still result in a
  // resolved Promise.
  const data = executeOperation(
    context as ExecutionContext,
    (context as ExecutionContext).operation,
    rootValue,
  );
  return buildResponse(
    context as ExecutionContext,
    data as MaybePromise<Record<string, {}> | null>,
  );
}

/**
 * Given a completed execution context and data, build the { errors, data }
 * response defined by the "Response" section of the GraphQL specification.
 * Checks to see if there are any deferred fields, returning a
 * DeferredExecutionResult if so.
 */
function buildResponse(
  context: ExecutionContext,
  data: MaybePromise<Record<string, {}> | null>,
): MaybePromise<ExecutionResult | DeferredExecutionResult> {
  if (isPromise(data)) {
    return data.then(resolved => buildResponse(context, resolved));
  }
  const result =
    context.errors.length === 0 ? { data } : { errors: context.errors, data };

  // Return a DeferredExecutionResult if there are deferred fields
  if (context.patchDispatcher) {
    return {
      initialResult: result,
      deferredPatches: context.patchDispatcher.getAsyncIterable(),
    } as DeferredExecutionResult;
  } else {
    return result as ExecutionResult;
  }
}

/**
 * Unchanged
 */
function executeOperation(
  exeContext: ExecutionContext,
  operation: OperationDefinitionNode,
  rootValue: {},
): MaybePromise<FieldValue> {
  const type = getOperationRootType(exeContext.schema, operation);
  const fields = collectFields(
    exeContext,
    type,
    operation.selectionSet,
    Object.create(null),
    Object.create(null),
  );

  const path = undefined;

  // Errors from sub-fields of a NonNull type may propagate to the top level,
  // at which point we still log the error and null the parent field, which
  // in this case is the entire response.
  //
  // Similar to completeValueCatchingError.
  try {
    const result =
      operation.operation === 'mutation'
        ? executeFieldsSerially(exeContext, type, rootValue, path, fields)
        : executeFields(exeContext, type, rootValue, path, fields);
    if (isPromise(result)) {
      return result.then(undefined, error => {
        exeContext.errors.push(error);
        return Promise.resolve(null);
      });
    }
    return result;
  } catch (error) {
    exeContext.errors.push(error);
    return null;
  }
}

/**
 * Unchanged but not exported in @types/graphql
 */
export function getOperationRootType(
  schema: GraphQLSchema,
  operation: OperationDefinitionNode,
): GraphQLObjectType {
  switch (operation.operation) {
    case 'query':
      const queryType = schema.getQueryType();
      if (!queryType) {
        throw new GraphQLError(
          'Schema does not define the required query root type.',
          [operation],
        );
      }
      return queryType;
    case 'mutation':
      const mutationType = schema.getMutationType();
      if (!mutationType) {
        throw new GraphQLError('Schema is not configured for mutations.', [
          operation,
        ]);
      }
      return mutationType;
    case 'subscription':
      const subscriptionType = schema.getSubscriptionType();
      if (!subscriptionType) {
        throw new GraphQLError('Schema is not configured for subscriptions.', [
          operation,
        ]);
      }
      return subscriptionType;
    default:
      throw new GraphQLError(
        'Can only execute queries, mutations and subscriptions.',
        [operation],
      );
  }
}

/**
 * Unchanged
 */
function executeFieldsSerially(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  sourceValue: {},
  path: ResponsePath | undefined,
  fields: Record<string, Array<FieldNode>>,
): MaybePromise<FieldValue> {
  return promiseReduce(
    Object.keys(fields),
    (results, responseName) => {
      const fieldNodes = fields[responseName];
      const fieldPath = addPath(path, responseName);
      const result = resolveField(
        exeContext,
        parentType,
        sourceValue,
        fieldNodes,
        fieldPath,
      );
      if (result === undefined) {
        return results;
      }
      if (isPromise(result)) {
        return result.then(resolvedResult => {
          results[responseName] = resolvedResult;
          return results;
        });
      }
      results[responseName] = result;
      return results;
    },
    Object.create(null),
  );
}

/**
 * Implements the "Evaluating selection sets" section of the spec
 * for "read" mode.
 */
function executeFields(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  sourceValue: FieldValue,
  path: ResponsePath | undefined,
  fields: Record<string, Array<FieldNode>>,
  closestDeferredParent?: string,
): MaybePromise<FieldValue> {
  const results = Object.create(null);
  let containsPromise = false;

  for (let i = 0, keys = Object.keys(fields); i < keys.length; ++i) {
    const responseName = keys[i];
    const fieldNodes = fields[responseName];
    const fieldPath = addPath(path, responseName);

    const result = resolveField(
      exeContext,
      parentType,
      sourceValue,
      fieldNodes,
      fieldPath,
      closestDeferredParent,
    );

    if (result !== undefined) {
      results[responseName] = result;
      if (!containsPromise && isPromise(result)) {
        containsPromise = true;
      }
    }
  }

  // If there are no promises, we can just return the object
  if (!containsPromise) {
    return results;
  }

  // Otherwise, results is a map from field name to the result
  // of resolving that field, which is possibly a promise. Return
  // a promise that will return this same map, but with any
  // promises replaced with the values they resolved to.
  return promiseForObject(results);
}

/**
 * Resolves the field on the given source object. In particular, this
 * figures out the value that the field returns by calling its resolve function,
 * then calls completeValue to complete promises, serialize scalars, or execute
 * the sub-selection-set for objects.
 */
function resolveField(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  source: FieldValue,
  fieldNodes: ReadonlyArray<FieldNode>,
  path: ResponsePath,
  closestDeferredParent?: string,
): MaybePromise<FieldValue> | undefined {
  const fieldNode = fieldNodes[0];
  const fieldName = fieldNode.name.value;

  const fieldDef = getFieldDef(exeContext.schema, parentType, fieldName);
  if (!fieldDef) {
    return;
  }

  const resolveFn = fieldDef.resolve || exeContext.fieldResolver;

  const info = buildResolveInfo(
    exeContext,
    fieldDef,
    fieldNodes,
    parentType,
    path,
  );

  // Get the resolve function, regardless of if its result is normal
  // or abrupt (error).
  const result = resolveFieldValueOrError(
    exeContext,
    fieldDef,
    fieldNodes,
    resolveFn,
    source,
    info,
  );

  return completeValueCatchingError(
    exeContext,
    fieldDef.type,
    fieldNodes,
    info,
    path,
    result,
    closestDeferredParent,
  );
}

/**
 * Unchanged but not exported from graphql.js
 */
function asErrorInstance(error: any): Error {
  return error instanceof Error ? error : new Error(error || undefined);
}

/**
 * Creates a bundle of patches, in a recursive structure that expresses the
 * dependencies between patches. We want to ensure that patches of child fields
 * get returned only after patches for its parent deferred field returns.
 */
function makePatchBundle(
  exeContext: ExecutionContext,
  path: ResponsePath,
  data: MaybePromise<FieldValue>,
): PatchBundle {
  if (isPromise(data)) {
    return data.then(resolvedData =>
      makePatchBundle(exeContext, path, resolvedData),
    );
  }
  const dependent = exeContext.deferredDependents
    ? exeContext.deferredDependents[responsePathAsArray(path).toString()]
    : undefined;

  return Promise.resolve({
    patch: formatDataAsPatch(path, data, dependent ? dependent.errors : []),
    dependentPatches: dependent ? dependent.patches : (dependent as undefined),
  });
}

/* This is a small wrapper around completeValue which detects and logs errors
 * in the execution context.
 *
 * If the field should be deferred, store a promise that resolves to a patch
 * containing the result, and return null to its parent immediately.
 *
 * If an error occurs while completing a value, it should be returned within
 * the patch of the closest deferred parent node. The ExecutionContext is used
 * to store a mapping to errors for each deferred field.
 */
function completeValueCatchingError(
  exeContext: ExecutionContext,
  returnType: GraphQLOutputType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: {},
  closestDeferredParent?: string,
): MaybePromise<FieldValue> {
  // Items in a list inherit the @defer directive applied on the list type,
  // but we do not need to defer the item itself.
  const pathArray = responsePathAsArray(path);
  const isListItem = typeof pathArray[pathArray.length - 1] === 'number';
  const shouldDefer =
    fieldNodes.every(node => shouldDeferNode(exeContext, node)) && !isListItem;

  // Throw error if @defer is applied to a non-nullable field,
  // this is already caught in the validation phase.
  if (isNonNullType(returnType) && shouldDefer) {
    throw locatedError(
      new Error(
        `@defer cannot be applied on non-nullable field ${
          info.parentType.name
        }.${info.fieldName}`,
      ),
      fieldNodes,
      responsePathAsArray(path),
    );
  }

  // Update closestDeferredParent if the current node is deferred
  const curClosestDeferredParent = shouldDefer
    ? responsePathAsArray(path).toString()
    : closestDeferredParent;

  try {
    let completed;
    if (isPromise(result)) {
      completed = result.then(resolved =>
        completeValue(
          exeContext,
          returnType,
          fieldNodes,
          info,
          path,
          resolved,
          curClosestDeferredParent,
        ),
      );
    } else {
      completed = completeValue(
        exeContext,
        returnType,
        fieldNodes,
        info,
        path,
        result,
        curClosestDeferredParent,
      );
    }

    if (shouldDefer) {
      // PatchBundle ensures the ordering of patches from nested deferred fields
      let promisedPatch: PatchBundle = makePatchBundle(
        exeContext,
        path,
        completed,
      );
      if (closestDeferredParent) {
        // If this field is a child of a deferred field, let the parent
        // dispatch it.
        deferPatchToParent(exeContext, closestDeferredParent, promisedPatch);
      } else {
        dispatchPatch(exeContext, promisedPatch);
      }

      // Return null instead of a Promise so execution does not wait for
      // this field to be resolved.
      return null;
    }

    // If field is not deferred, execution proceeds normally.
    if (isPromise(completed)) {
      // Note: we don't rely on a `catch` method, but we do expect "thenable"
      // to take a second callback for the error case.
      return completed.then(undefined, error => {
        if (closestDeferredParent) {
          // If this field is a child of a deferred field, return errors from it
          // with the appropriate patch.
          handleDeferredFieldError(
            error,
            fieldNodes,
            path,
            returnType,
            exeContext,
            closestDeferredParent,
          );
          return null;
        } else {
          // Otherwise handle error normally
          return handleFieldError(
            error,
            fieldNodes,
            path,
            returnType,
            exeContext,
          );
        }
      });
    }
    return completed;
  } catch (error) {
    if (closestDeferredParent || shouldDefer) {
      handleDeferredFieldError(
        error,
        fieldNodes,
        path,
        returnType,
        exeContext,
        closestDeferredParent,
      );
      return null;
    } else {
      return handleFieldError(error, fieldNodes, path, returnType, exeContext);
    }
  }
}

/**
 * This helper function actually comes from v14 of graphql.js.
 * Using it because its much more readable, and will make merging easier when
 * we upgrade.
 */
function handleFieldError(
  rawError: Error,
  fieldNodes: ReadonlyArray<FieldNode>,
  path: ResponsePath,
  returnType: GraphQLOutputType,
  context: ExecutionContext,
) {
  const error = locatedError(
    asErrorInstance(rawError),
    fieldNodes,
    responsePathAsArray(path),
  );

  // If the field type is non-nullable, then it is resolved without any
  // protection from errors, however it still properly locates the error.
  if (isNonNullType(returnType)) {
    throw error;
  }

  // Otherwise, error protection is applied, logging the error and resolving
  // a null value for this field if one is encountered.
  context.errors.push(error);
  return null;
}

/**
 * This method provides field level error handling for deferred fields, or
 * child nodes of a deferred field. Throw error if return type is
 * non-nullable.
 *
 * - If it is a deferred field, the error should be sent with the patch for the
 *   field.
 * - If it is a child node of a deferred field, store the errors on exeContext
 *   to be retrieved by that parent deferred field.
 */
function handleDeferredFieldError(
  rawError: Error,
  fieldNodes: ReadonlyArray<FieldNode>,
  path: ResponsePath,
  _: GraphQLOutputType,
  exeContext: ExecutionContext,
  closestDeferredParent?: string,
): void {
  const error = locatedError(
    asErrorInstance(rawError),
    fieldNodes,
    responsePathAsArray(path),
  );

  const dependent = exeContext.deferredDependents
    ? exeContext.deferredDependents[responsePathAsArray(path).toString()]
    : undefined;

  const shouldDefer = fieldNodes.every(node =>
    shouldDeferNode(exeContext, node),
  );
  if (shouldDefer) {
    // If this node is itself deferred, then send errors with this patch
    const patch = formatDataAsPatch(path, null, [error]);
    const promisedPatch = Promise.resolve({
      patch,
      dependentPatches: dependent ? dependent.patches : dependent,
    });
    if (closestDeferredParent) {
      deferPatchToParent(exeContext, closestDeferredParent, promisedPatch);
    } else {
      dispatchPatch(exeContext, promisedPatch);
    }
  }

  // If it is its parent that is deferred, errors should be returned with the
  // parent's patch, so store it on ExecutionContext first.
  if (closestDeferredParent) {
    deferErrorToParent(exeContext, closestDeferredParent, error);
  }
}

/**
 * Implements the instructions for completeValue as defined in the
 * "Field entries" section of the spec.
 *
 * If the field type is Non-Null, then this recursively completes the value
 * for the inner type. It throws a field error if that completion returns null,
 * as per the "Nullability" section of the spec.
 *
 * If the field type is a List, then this recursively completes the value
 * for the inner type on each item in the list.
 *
 * If the field type is a Scalar or Enum, ensures the completed value is a legal
 * value of the type by calling the `serialize` method of GraphQL type
 * definition.
 *
 * If the field is an abstract type, determine the runtime type of the value
 * and then complete based on that type
 *
 * Otherwise, the field type expects a sub-selection set, and will complete the
 * value by evaluating all sub-selections.
 */
function completeValue(
  exeContext: ExecutionContext,
  returnType: GraphQLOutputType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: MaybePromise<FieldValue>,
  closestDeferredParent?: string,
): MaybePromise<FieldValue> {
  // If result is an Error, throw a located error.
  if (result instanceof Error) {
    throw result;
  }

  // If field type is NonNull, complete for inner type, and throw field error
  // if result is null.
  if (isNonNullType(returnType)) {
    const completed = completeValue(
      exeContext,
      returnType.ofType,
      fieldNodes,
      info,
      path,
      result,
      closestDeferredParent,
    );
    if (completed === null) {
      throw new Error(
        `Cannot return null for non-nullable field ${info.parentType.name}.${
          info.fieldName
        }.`,
      );
    }
    return completed;
  }

  // If result value is null-ish (null, undefined, or NaN) then return null.
  if (isNullish(result)) {
    return null;
  }

  // If field type is List, complete each item in the list with the inner type
  if (isListType(returnType)) {
    return completeListValue(
      exeContext,
      returnType,
      fieldNodes,
      info,
      path,
      result,
      closestDeferredParent,
    );
  }

  // If field type is a leaf type, Scalar or Enum, serialize to a valid value,
  // returning null if serialization is not possible.
  if (isLeafType(returnType)) {
    return completeLeafValue(returnType, result);
  }

  // If field type is an abstract type, Interface or Union, determine the
  // runtime Object type and complete for that type.
  if (isAbstractType(returnType)) {
    return completeAbstractValue(
      exeContext,
      returnType,
      fieldNodes,
      info,
      path,
      result,
      closestDeferredParent,
    );
  }

  // If field type is Object, execute and complete all sub-selections.
  if (isObjectType(returnType)) {
    return completeObjectValue(
      exeContext,
      returnType,
      fieldNodes,
      info,
      path,
      result,
      closestDeferredParent,
    );
  }

  // Not reachable. All possible output types have been considered.
  /* istanbul ignore next */
  throw new Error(
    `Cannot complete value of unexpected type "${String(returnType as any)}".`,
  );
}

/**
 * Complete a list value by completing each item in the list with the
 * inner type
 */
function completeListValue(
  exeContext: ExecutionContext,
  returnType: GraphQLList<GraphQLOutputType>,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: MaybePromise<FieldValue>,
  closestDeferredParent?: string,
): MaybePromise<FieldValue> {
  invariant(
    isCollection(result),
    `Expected Iterable, but did not find one for field ${
      info.parentType.name
    }.${info.fieldName}.`,
  );

  // This is specified as a simple map, however we're optimizing the path
  // where the list contains no Promises by avoiding creating another Promise.
  const itemType = returnType.ofType;
  let containsPromise = false;
  const completedResults: MaybePromise<FieldValue>[] = [];
  forEach(result as any, (item, index) => {
    // No need to modify the info object containing the path,
    // since from here on it is not ever accessed by resolver functions.
    const fieldPath = addPath(path, index);
    const completedItem = completeValueCatchingError(
      exeContext,
      itemType,
      fieldNodes,
      info,
      fieldPath,
      item,
      closestDeferredParent,
    );

    if (!containsPromise && isPromise(completedItem)) {
      containsPromise = true;
    }
    completedResults.push(completedItem);
  });

  return containsPromise ? Promise.all(completedResults) : completedResults;
}

/**
 * Complete a Scalar or Enum by serializing to a valid value, returning
 * null if serialization is not possible.
 */
function completeLeafValue(
  returnType: GraphQLLeafType,
  result: MaybePromise<FieldValue>,
): FieldValue {
  invariant(returnType.serialize, 'Missing serialize method on type');
  const serializedResult = returnType.serialize(result);
  if (isInvalid(serializedResult)) {
    throw new Error(
      `Expected a value of type "${String(returnType)}" but ` +
        `received: ${String(result)}`,
    );
  }
  return serializedResult;
}

/**
 * Complete a value of an abstract type by determining the runtime object type
 * of that value, then complete the value for that type.
 */
function completeAbstractValue(
  exeContext: ExecutionContext,
  returnType: GraphQLAbstractType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: MaybePromise<FieldValue>,
  closestDeferredParent?: string,
): MaybePromise<FieldValue> {
  const runtimeType = returnType.resolveType
    ? returnType.resolveType(result, exeContext.contextValue, info)
    : defaultResolveTypeFn(
        result as { __typename?: string },
        exeContext.contextValue,
        info,
        returnType,
      );

  if (isPromise(runtimeType)) {
    return runtimeType.then(resolvedRuntimeType =>
      completeObjectValue(
        exeContext,
        ensureValidRuntimeType(
          resolvedRuntimeType as string | GraphQLObjectType,
          exeContext,
          returnType,
          fieldNodes,
          info,
          result as FieldValue,
        ),
        fieldNodes,
        info,
        path,
        result,
        closestDeferredParent,
      ),
    );
  }

  return completeObjectValue(
    exeContext,
    ensureValidRuntimeType(
      runtimeType as string | GraphQLObjectType,
      exeContext,
      returnType,
      fieldNodes,
      info,
      result as FieldValue,
    ),
    fieldNodes,
    info,
    path,
    result,
    closestDeferredParent,
  );
}

/**
 * Unchanged but not exported from graphql.js
 */
function ensureValidRuntimeType(
  runtimeTypeOrName: GraphQLObjectType | string,
  exeContext: ExecutionContext,
  returnType: GraphQLAbstractType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  result: FieldValue,
): GraphQLObjectType {
  const runtimeType =
    typeof runtimeTypeOrName === 'string'
      ? exeContext.schema.getType(runtimeTypeOrName)
      : runtimeTypeOrName;

  if (!isObjectType(runtimeType as GraphQLType)) {
    throw new GraphQLError(
      `Abstract type ${returnType.name} must resolve to an Object type at ` +
        `runtime for field ${info.parentType.name}.${info.fieldName} with ` +
        `value "${String(result)}", received "${String(runtimeType)}". ` +
        `Either the ${returnType.name} type should provide a "resolveType" ` +
        'function or each possible types should provide an ' +
        '"isTypeOf" function.',
      fieldNodes,
    );
  }

  if (
    !exeContext.schema.isPossibleType(
      returnType,
      runtimeType as GraphQLObjectType,
    )
  ) {
    throw new GraphQLError(
      `Runtime Object type "${
        (runtimeType as GraphQLObjectType).name
      }" is not a possible type ` + `for "${returnType.name}".`,
      fieldNodes,
    );
  }

  return runtimeType as GraphQLObjectType;
}

/**
 * Complete an Object value by executing all sub-selections.
 */
function completeObjectValue(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: ResponsePath,
  result: MaybePromise<FieldValue>,
  closestDeferredParent?: string,
): MaybePromise<FieldValue> {
  // If there is an isTypeOf predicate function, call it with the
  // current result. If isTypeOf returns false, then raise an error rather
  // than continuing execution.
  if (returnType.isTypeOf) {
    const isTypeOf = returnType.isTypeOf(result, exeContext.contextValue, info);

    if (isPromise(isTypeOf)) {
      return isTypeOf.then(resolvedIsTypeOf => {
        if (!resolvedIsTypeOf) {
          throw invalidReturnTypeError(
            returnType,
            result as FieldValue,
            fieldNodes,
          );
        }
        return collectAndExecuteSubfields(
          exeContext,
          returnType,
          fieldNodes,
          info,
          path,
          result as FieldValue,
          closestDeferredParent,
        );
      });
    }

    if (!isTypeOf) {
      throw invalidReturnTypeError(
        returnType,
        result as FieldValue,
        fieldNodes,
      );
    }
  }

  return collectAndExecuteSubfields(
    exeContext,
    returnType,
    fieldNodes,
    info,
    path,
    result as FieldValue,
    closestDeferredParent,
  );
}

function invalidReturnTypeError(
  returnType: GraphQLObjectType,
  result: FieldValue,
  fieldNodes: ReadonlyArray<FieldNode>,
): GraphQLError {
  return new GraphQLError(
    `Expected value of type "${returnType.name}" but got: ${String(result)}.`,
    fieldNodes,
  );
}

function collectAndExecuteSubfields(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
  _: GraphQLResolveInfo,
  path: ResponsePath,
  result: FieldValue,
  closestDeferredParent?: string,
): MaybePromise<FieldValue> {
  // Collect sub-fields to execute to complete this value.
  const subFieldNodes = collectSubfields(exeContext, returnType, fieldNodes);
  return executeFields(
    exeContext,
    returnType,
    result,
    path,
    subFieldNodes,
    closestDeferredParent,
  );
}

/**
 * Unchanged but not exported from graphql.js
 */
const collectSubfields = memoize3(_collectSubfields);
function _collectSubfields(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
): Record<string, Array<FieldNode>> {
  let subFieldNodes = Object.create(null);
  const visitedFragmentNames = Object.create(null);
  for (let i = 0; i < fieldNodes.length; i++) {
    const selectionSet = fieldNodes[i].selectionSet;
    if (selectionSet) {
      subFieldNodes = collectFields(
        exeContext,
        returnType,
        selectionSet,
        subFieldNodes,
        visitedFragmentNames,
      );
    }
  }
  return subFieldNodes;
}

/**
 * Unchanged but not exported from graphql.js
 */
function defaultResolveTypeFn(
  value: { __typename?: string },
  context: {},
  info: GraphQLResolveInfo,
  abstractType: GraphQLAbstractType,
):
  | GraphQLObjectType
  | string
  | undefined
  | Promise<GraphQLObjectType | string | undefined> {
  // First, look for `__typename`.
  if (
    value !== null &&
    typeof value === 'object' &&
    typeof value.__typename === 'string'
  ) {
    return value.__typename;
  }

  // Otherwise, test each possible type.
  const possibleTypes = info.schema.getPossibleTypes(abstractType);
  const promisedIsTypeOfResults: Promise<boolean>[] = [];

  for (let i = 0; i < possibleTypes.length; i++) {
    const type = possibleTypes[i];

    if (type.isTypeOf) {
      const isTypeOfResult = type.isTypeOf(value, context, info);

      if (isPromise(isTypeOfResult)) {
        promisedIsTypeOfResults[i] = isTypeOfResult;
      } else if (isTypeOfResult) {
        return type;
      }
    }
  }

  if (promisedIsTypeOfResults.length) {
    return Promise.all(promisedIsTypeOfResults).then(isTypeOfResults => {
      for (let i = 0; i < isTypeOfResults.length; i++) {
        if (isTypeOfResults[i]) {
          return possibleTypes[i];
        }
      }
      return;
    });
  }
  return;
}
