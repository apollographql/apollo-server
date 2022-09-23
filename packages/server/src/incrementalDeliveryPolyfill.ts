import { execute, ExecutionArgs, ExecutionResult, GraphQLError } from 'graphql';

// This file "polyfills" graphql@17's experimentalExecuteIncrementally (by
// returning a function that does not understand incremental directives if
// you're using graphql@16). The types defined in this file are largely copied
// from graphql-js.

interface ObjMap<T> {
  [key: string]: T;
}
export interface GraphQLExperimentalInitialIncrementalExecutionResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends ExecutionResult<TData, TExtensions> {
  hasNext: boolean;
  incremental?: ReadonlyArray<
    GraphQLExperimentalIncrementalResult<TData, TExtensions>
  >;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalSubsequentIncrementalExecutionResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  hasNext: boolean;
  incremental?: ReadonlyArray<
    GraphQLExperimentalIncrementalResult<TData, TExtensions>
  >;
  extensions?: TExtensions;
}

type GraphQLExperimentalIncrementalResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> =
  | GraphQLExperimentalIncrementalDeferResult<TData, TExtensions>
  | GraphQLExperimentalIncrementalStreamResult<TData, TExtensions>;

interface GraphQLExperimentalIncrementalDeferResult<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> extends ExecutionResult<TData, TExtensions> {
  path?: ReadonlyArray<string | number>;
  label?: string;
}

interface GraphQLExperimentalIncrementalStreamResult<
  TData = Array<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  errors?: ReadonlyArray<GraphQLError>;
  items?: TData | null;
  path?: ReadonlyArray<string | number>;
  label?: string;
  extensions?: TExtensions;
}

export interface GraphQLExperimentalIncrementalExecutionResults<
  TData = ObjMap<unknown>,
  TExtensions = ObjMap<unknown>,
> {
  initialResult: GraphQLExperimentalInitialIncrementalExecutionResult<
    TData,
    TExtensions
  >;
  subsequentResults: AsyncGenerator<
    GraphQLExperimentalSubsequentIncrementalExecutionResult<TData, TExtensions>,
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
      ExecutionResult | GraphQLExperimentalIncrementalExecutionResults
    >)
  | null
  | undefined = undefined;

async function tryToLoadGraphQL17() {
  if (graphqlExperimentalExecuteIncrementally !== undefined) {
    return;
  }
  const graphql = await import('graphql');
  if ('experimentalExecuteIncrementally' in graphql) {
    graphqlExperimentalExecuteIncrementally = (graphql as any)
      .experimentalExecuteIncrementally;
  } else {
    graphqlExperimentalExecuteIncrementally = null;
  }
}

export async function executeIncrementally(
  args: ExecutionArgs,
): Promise<ExecutionResult | GraphQLExperimentalIncrementalExecutionResults> {
  await tryToLoadGraphQL17();
  if (graphqlExperimentalExecuteIncrementally) {
    return graphqlExperimentalExecuteIncrementally(args);
  }
  return execute(args);
}
