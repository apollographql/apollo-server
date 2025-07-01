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

export interface GraphQLExperimentalFormattedInitialIncrementalExecutionResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends FormattedExecutionResult<TData, TExtensions> {
  hasNext: boolean;
  incremental?: ReadonlyArray<
    GraphQLExperimentalFormattedIncrementalResult<TData, TExtensions>
  >;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  hasNext: boolean;
  incremental?: ReadonlyArray<
    GraphQLExperimentalFormattedIncrementalResult<TData, TExtensions>
  >;
  extensions?: TExtensions;
}

export type GraphQLExperimentalFormattedIncrementalResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> =
  | GraphQLExperimentalFormattedIncrementalDeferResult<TData, TExtensions>
  | GraphQLExperimentalFormattedIncrementalStreamResult<TData, TExtensions>;

export interface GraphQLExperimentalFormattedIncrementalDeferResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends FormattedExecutionResult<TData, TExtensions> {
  path?: ReadonlyArray<string | number>;
  label?: string;
}

export interface GraphQLExperimentalFormattedIncrementalStreamResult<
  TData = Array<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  errors?: ReadonlyArray<GraphQLFormattedError>;
  items?: TData | null;
  path?: ReadonlyArray<string | number>;
  label?: string;
  extensions?: TExtensions;
}
