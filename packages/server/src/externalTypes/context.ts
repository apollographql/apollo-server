export type BaseContext = {};

// Integration authors should use this type for typing their own user-provided
// context function. See the express middleware for a usage example.
export type ContextFunction<
  TIntegrationSpecificArgs extends any[],
  TContext extends BaseContext = BaseContext,
> = (...integrationContext: TIntegrationSpecificArgs) => Promise<TContext>;

// This is used in executeHTTPGraphQLRequest so that that function can apply
// consistent error handling if it throws. Web framework integrations typically
// pass a function which passes integration-specific parameters to a
// user-provided ContextFunction.
export type ContextThunk<TContext extends BaseContext = BaseContext> =
  () => Promise<TContext>;
