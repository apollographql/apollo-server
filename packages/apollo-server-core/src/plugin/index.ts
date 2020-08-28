// apollo-server-core ships with several plugins. Some of them have relatively
// heavy-weight or Node-specific dependencies. To avoid having to import these
// dependencies in every single usage of apollo-server-core, all the plugins
// are exported at runtime via this file. The rules are:
//
// - Files in apollo-server-core outside of `plugin` should not import anything
//   from a nested directory under `plugin` directly, but should always go
//   through this file.
// - This file may not have any plain top-level `import` directives
// - It may have top-level `import type` directives, which are included
//   in the generated TypeScript `.d.ts` file but not in the JS `.js` file.
// - It may call `require` at runtime to pull in the individual plugins,
//   via functions that have the same interface as functions in the individual
//   plugins.
//
// The goal is that the generated `dist/plugin/index.js` file has no top-level
// require calls.
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

import type {
  ApolloServerPluginUsageReportingOptions,
  EngineReportingOptions,
} from './usageReporting';
export type {
  ApolloServerPluginUsageReportingOptions,
  SendValuesBaseOptions,
  VariableValueOptions,
  ClientInfo,
  GenerateClientInfo,
  EngineReportingOptions, // deprecated
} from './usageReporting';

import type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';
export type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';
import type { ApolloServerPluginInlineTraceOptions } from './inlineTrace';
export type { ApolloServerPluginInlineTraceOptions } from './inlineTrace';

//#region Usage reporting
export function ApolloServerPluginUsageReporting<TContext>(
  options: ApolloServerPluginUsageReportingOptions<TContext> = Object.create(
    null,
  ),
): ApolloServerPlugin {
  return require('./usageReporting').ApolloServerPluginUsageReporting(options);
}
export function ApolloServerPluginUsageReportingDisabled(): ApolloServerPlugin {
  return require('./usageReporting').ApolloServerPluginUsageReportingDisabled();
}
export function ApolloServerPluginUsageReportingFromLegacyOptions<TContext>(
  options: EngineReportingOptions<TContext> = Object.create(null),
): ApolloServerPlugin {
  return require('./usageReporting').ApolloServerPluginUsageReportingFromLegacyOptions(
    options,
  );
}
//#endregion

//#region Schema reporting
export function ApolloServerPluginSchemaReporting(
  options: ApolloServerPluginSchemaReportingOptions = Object.create(null),
): ApolloServerPlugin {
  return require('./schemaReporting').ApolloServerPluginSchemaReporting(
    options,
  );
}
//#endregion

//#region Inline trace
export function ApolloServerPluginInlineTrace(
  options: ApolloServerPluginInlineTraceOptions = Object.create(null),
): ApolloServerPlugin {
  return require('./inlineTrace').ApolloServerPluginInlineTrace(options);
}
export function ApolloServerPluginInlineTraceDisabled(): ApolloServerPlugin {
  return require('./inlineTrace').ApolloServerPluginInlineTraceDisabled();
}
//#endregion
