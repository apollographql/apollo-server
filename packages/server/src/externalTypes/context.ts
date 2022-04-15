export type BaseContext = {};

export type ContextFunction<TContext extends BaseContext = BaseContext> =
  () => Promise<TContext>;
