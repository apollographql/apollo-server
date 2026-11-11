import {
  experimentalExecuteIncrementally,
  legacyExecuteIncrementally,
  type ExecutionArgs,
  type ExecutionResult,
  type GraphQLError,
} from 'graphql';
import { type LegacyExperimentalExecuteIncrementally } from './externalTypes/graphql.js';

// This file wraps graphql@17's experimentalExecuteIncrementally and
// legacyExecuteIncrementally. The types defined in this file are largely
// copied from graphql-js.

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
  if (useLegacyIncremental) {
    // An explicitly configured function takes precedence over graphql-js's
    // built-in legacy format.
    return (
      legacyExperimentalExecuteIncrementally ?? legacyExecuteIncrementally
    )(args);
  }

  return experimentalExecuteIncrementally(args) as Promise<
    ExecutionResult | GraphQLExperimentalIncrementalExecutionResultsAlpha9
  >;
}
