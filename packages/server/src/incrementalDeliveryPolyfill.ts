import {
  execute,
  type ExecutionArgs,
  type ExecutionResult,
  type GraphQLError,
} from 'graphql';
import { BadRequestError } from './internalErrorClasses.js';
import { MEDIA_TYPES } from './ApolloServer.js';
import { type LegacyExperimentalExecuteIncrementally } from './externalTypes/graphql.js';

// This file "polyfills" graphql@17's experimentalExecuteIncrementally (by
// returning a function that does not understand incremental directives if
// you're using graphql@16). The types defined in this file are largely copied
// from graphql-js.

interface ObjMap<T> {
  [key: string]: T;
}

// 17.0.0-alpha.2
export interface GraphQLExperimentalInitialIncrementalExecutionResultAlpha2<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends ExecutionResult<TData, TExtensions> {
  hasNext: boolean;
  incremental?: ReadonlyArray<
    GraphQLExperimentalIncrementalResultAlpha2<TData, TExtensions>
  >;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalSubsequentIncrementalExecutionResultAlpha2<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  hasNext: boolean;
  incremental?: ReadonlyArray<
    GraphQLExperimentalIncrementalResultAlpha2<TData, TExtensions>
  >;
  extensions?: TExtensions;
}

type GraphQLExperimentalIncrementalResultAlpha2<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> =
  | GraphQLExperimentalIncrementalDeferResultAlpha2<TData, TExtensions>
  | GraphQLExperimentalIncrementalStreamResultAlpha2<TData, TExtensions>;

interface GraphQLExperimentalIncrementalDeferResultAlpha2<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends ExecutionResult<TData, TExtensions> {
  path?: ReadonlyArray<string | number>;
  label?: string;
}

interface GraphQLExperimentalIncrementalStreamResultAlpha2<
  TData = Array<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  errors?: ReadonlyArray<GraphQLError>;
  items?: TData | null;
  path?: ReadonlyArray<string | number>;
  label?: string;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalIncrementalExecutionResultsAlpha2<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  initialResult: GraphQLExperimentalInitialIncrementalExecutionResultAlpha2<
    TData,
    TExtensions
  >;
  subsequentResults: AsyncGenerator<
    GraphQLExperimentalSubsequentIncrementalExecutionResultAlpha2<
      TData,
      TExtensions
    >,
    void,
    void
  >;
}

// 17.0.0-alpha.9
export interface GraphQLExperimentalInitialIncrementalExecutionResultAlpha9<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends ExecutionResult<TData, TExtensions> {
  data: TData;
  pending: ReadonlyArray<GraphQLExperimentalPendingResultAlpha9>;
  hasNext: true;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalSubsequentIncrementalExecutionResultAlpha9<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  pending?: ReadonlyArray<GraphQLExperimentalPendingResultAlpha9>;
  incremental?: ReadonlyArray<
    GraphQLExperimentalIncrementalResultAlpha9<TData, TExtensions>
  >;
  completed?: ReadonlyArray<GraphQLExperimentalCompletedResultAlpha9>;
  hasNext: boolean;
  extensions?: TExtensions;
}

interface GraphQLExperimentalExecutionGroupResultAlpha9<
  TData = ObjMap<unknown>,
> {
  errors?: ReadonlyArray<GraphQLError>;
  data: TData;
}

interface GraphQLExperimentalIncrementalDeferResultAlpha9<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends GraphQLExperimentalExecutionGroupResultAlpha9<TData> {
  id: string;
  subPath?: ReadonlyArray<string | number>;
  extensions?: TExtensions;
}

interface GraphQLExperimentalStreamItemsRecordResultAlpha9<
  TData = ReadonlyArray<unknown>,
> {
  errors?: ReadonlyArray<GraphQLError>;
  items: TData;
}

interface GraphQLExperimentalIncrementalStreamResultAlpha9<
  TData = ReadonlyArray<unknown>,
  TExtensions = ObjMap<unknown>,
> extends GraphQLExperimentalStreamItemsRecordResultAlpha9<TData> {
  id: string;
  subPath?: ReadonlyArray<string | number>;
  extensions?: TExtensions;
}

type GraphQLExperimentalIncrementalResultAlpha9<
  TData = unknown,
  TExtensions = ObjMap<unknown>,
> =
  | GraphQLExperimentalIncrementalDeferResultAlpha9<TData, TExtensions>
  | GraphQLExperimentalIncrementalStreamResultAlpha9<TData, TExtensions>;

interface GraphQLExperimentalPendingResultAlpha9 {
  id: string;
  path: ReadonlyArray<string | number>;
  label?: string;
}

interface GraphQLExperimentalCompletedResultAlpha9 {
  id: string;
  errors?: ReadonlyArray<GraphQLError>;
}

export interface GraphQLExperimentalIncrementalExecutionResultsAlpha9<
  TInitial = ObjMap<unknown>,
  TSubsequent = unknown,
  TExtensions = ObjMap<unknown>,
> {
  initialResult: GraphQLExperimentalInitialIncrementalExecutionResultAlpha9<
    TInitial,
    TExtensions
  >;
  subsequentResults: AsyncGenerator<
    GraphQLExperimentalSubsequentIncrementalExecutionResultAlpha9<
      TSubsequent,
      TExtensions
    >,
    void,
    void
  >;
}

type PromiseOrValue<T> = Promise<T> | T;

// This starts as undefined and is set to a function or null by running
// tryToLoadGraphQL17(). If graphql-js 17 is installed, it is set to the
// experimentalExecuteIncrementally function from that package; otherwise it is
// set to null.
let graphqlExperimentalExecuteIncrementally:
  | ((
      args: ExecutionArgs,
    ) => PromiseOrValue<
      ExecutionResult | GraphQLExperimentalIncrementalExecutionResultsAlpha9
    >)
  | null
  | undefined = undefined;

async function tryToLoadGraphQL17() {
  if (graphqlExperimentalExecuteIncrementally !== undefined) {
    return;
  }

  const graphql = await import('graphql');
  if (
    graphql.version === '17.0.0-alpha.9' &&
    'experimentalExecuteIncrementally' in graphql
  ) {
    graphqlExperimentalExecuteIncrementally = (graphql as any)
      .experimentalExecuteIncrementally;
  } else {
    graphqlExperimentalExecuteIncrementally = null;
  }
}

export async function executeIncrementally({
  useLegacyIncremental,
  legacyExperimentalExecuteIncrementally,
  ...args
}: ExecutionArgs & {
  useLegacyIncremental?: boolean;
  legacyExperimentalExecuteIncrementally:
    | LegacyExperimentalExecuteIncrementally
    | undefined;
}): Promise<
  | ExecutionResult
  | GraphQLExperimentalIncrementalExecutionResultsAlpha2
  | GraphQLExperimentalIncrementalExecutionResultsAlpha9
> {
  await tryToLoadGraphQL17();

  if (useLegacyIncremental) {
    if (legacyExperimentalExecuteIncrementally) {
      return legacyExperimentalExecuteIncrementally(args);
    }

    // Only throw if the server supports incremental delivery with the new
    // format, but not the legacy format. We don't want to accidentally send
    // alpha.9 format when the client requested the legacy format.
    if (graphqlExperimentalExecuteIncrementally) {
      throw new BadRequestError(
        'Apollo Server received an operation that uses incremental delivery ' +
          '(@defer or @stream) with the legacy incremental format, but the server ' +
          'does not support the legacy incremental delivery format. Add the HTTP ' +
          `header: 'Accept: ${MEDIA_TYPES.MULTIPART_MIXED_EXPERIMENTAL_ALPHA_9}' ` +
          'to use the current incremental delivery format',
        // Use 406 Not Accepted
        { extensions: { http: { status: 406 } } },
      );
    }
  }

  if (graphqlExperimentalExecuteIncrementally) {
    return graphqlExperimentalExecuteIncrementally(args);
  }
  return execute(args);
}
