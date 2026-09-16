/**
 * This file represents the external type definitions needed by end users,
 * integration implementors, and plugin implementors. Everything from this file
 * is re-exported by the root (via * export), so add exports to this file with
 * intention (it's public API).
 */
export type { BaseContext, ContextFunction, ContextThunk } from './context.js';
export type {
  GraphQLRequest,
  GraphQLResponse,
  LegacyExperimentalExecuteIncrementally,
} from './graphql.js';
export type {
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
  HTTPGraphQLHead,
} from './http.js';
export type {
  ApolloServerPlugin,
  GraphQLFieldResolverParams,
  GraphQLRequestExecutionListener,
  GraphQLRequestListener,
  GraphQLRequestListenerDidResolveField,
  GraphQLRequestListenerExecutionDidEnd,
  GraphQLRequestListenerParsingDidEnd,
  GraphQLRequestListenerValidationDidEnd,
  GraphQLSchemaContext,
  GraphQLServerListener,
  GraphQLServerContext,
  LandingPage,
} from './plugins.js';
export type {
  GraphQLRequestContext,
  GraphQLRequestMetrics,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidResolveSource,
  GraphQLRequestContextExecutionDidStart,
  GraphQLRequestContextParsingDidStart,
  GraphQLRequestContextResponseForOperation,
  GraphQLRequestContextValidationDidStart,
  GraphQLRequestContextWillSendResponse,
} from './requestPipeline.js';
export type {
  DocumentStore,
  ApolloConfigInput,
  ApolloConfig,
  PersistedQueryOptions,
  CSRFPreventionOptions,
  ApolloServerOptionsWithSchema,
  ApolloServerOptionsWithTypeDefs,
  ApolloServerOptionsWithStaticSchema,
  ApolloServerOptionsWithGateway,
  ApolloServerOptions,
} from './constructor.js';

export type {
  GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha2,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha2,
  GraphQLExperimentalFormattedIncrementalResultAlpha2,
  GraphQLExperimentalFormattedIncrementalDeferResultAlpha2,
  GraphQLExperimentalFormattedIncrementalStreamResultAlpha2,
} from './incrementalDeliveryPolyfillAlpha2.js';

export type {
  GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha9,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha9,
  GraphQLExperimentalFormattedIncrementalStreamResultAlpha9,
  GraphQLExperimentalFormattedIncrementalDeferResultAlpha9,
  GraphQLExperimentalFormattedCompletedResultAlpha9,
  GraphQLExperimentalFormattedIncrementalResultAlpha9,
  GraphQLExperimentalPendingResultAlpha9,
} from './incrementalDeliveryPolyfillAlpha9.js';
