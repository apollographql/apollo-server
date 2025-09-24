import type { FormattedExecutionResult, GraphQLFormattedError } from 'graphql';

// This file defines types used in our public interface that will be imported
// from `graphql-js` once graphql 17 is released. It is possible that these
// types will change slightly before the final v17 is released, in which case
// the relevant parts of our API may change incompatibly in a minor version of
// AS5; this should not affect any users who aren't explicitly installing
// pre-releases of graphql 17.

interface ObjMap<T> {
  [key: string]: T;
}

export interface GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha9<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends FormattedExecutionResult<TData, TExtensions> {
  data: TData;
  pending: ReadonlyArray<GraphQLExperimentalPendingResultAlpha9>;
  hasNext: boolean;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha9<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  hasNext: boolean;
  pending?: ReadonlyArray<GraphQLExperimentalPendingResultAlpha9>;
  incremental?: ReadonlyArray<
    GraphQLExperimentalFormattedIncrementalResultAlpha9<TData, TExtensions>
  >;
  completed?: ReadonlyArray<GraphQLExperimentalFormattedCompletedResultAlpha9>;
  extensions?: TExtensions;
}

export type GraphQLExperimentalFormattedIncrementalResultAlpha9<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> =
  | GraphQLExperimentalFormattedIncrementalDeferResultAlpha9<TData, TExtensions>
  | GraphQLExperimentalFormattedIncrementalStreamResultAlpha9<
      TData,
      TExtensions
    >;

export interface GraphQLExperimentalFormattedIncrementalDeferResultAlpha9<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  errors?: ReadonlyArray<GraphQLFormattedError>;
  data: TData;
  id: string;
  subPath?: ReadonlyArray<string | number>;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalFormattedIncrementalStreamResultAlpha9<
  TData = Array<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  errors?: ReadonlyArray<GraphQLFormattedError>;
  items: TData;
  id: string;
  subPath?: ReadonlyArray<string | number>;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalPendingResultAlpha9 {
  id: string;
  path: ReadonlyArray<string | number>;
  label?: string;
}

// Deviation. The type implemented in alpha.9 is wrong. The type below is the
// correct type implementation. We may or may not need to provide a patch.
//
// This has been fixed by https://github.com/graphql/graphql-js/pull/4481
export interface GraphQLExperimentalFormattedCompletedResultAlpha9 {
  id: string;
  errors?: ReadonlyArray<GraphQLFormattedError>;
}
