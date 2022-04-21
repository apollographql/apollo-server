export type BaseContext = {};

// Integration authors should use this type for typing their own user-provided
// context function. See the express middleware for a usage example.
export type ContextFunction<
  TIntegrationSpecificArgs extends any[],
  TContext extends BaseContext = BaseContext,
> = (...integrationContext: TIntegrationSpecificArgs) => Promise<TContext>;
