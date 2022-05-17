// @apollo/server ships with several plugins. Some of them have relatively
// heavy-weight or Node-specific dependencies. To avoid having to import these
// dependencies in every single usage of @apollo/server, all the plugins
// are exported at runtime via this file. The rules are:
//
// - Files in @apollo/server outside of `plugin` should not import anything
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
import type { BaseContext, ApolloServerPlugin } from '../externalTypes';
import type {
  InternalApolloServerPlugin,
  InternalPluginId,
} from '../internalPlugin';

function disabledPlugin<TContext extends BaseContext>(
  id: InternalPluginId,
): ApolloServerPlugin<TContext> {
  const plugin: InternalApolloServerPlugin<TContext> = {
    __internal_plugin_id__() {
      return id;
    },
  };
  return plugin;
}

//#region Usage reporting
import type { ApolloServerPluginUsageReportingOptions } from './usageReporting';
export type {
  ApolloServerPluginUsageReportingOptions,
  SendValuesBaseOptions,
  VariableValueOptions,
  ClientInfo,
  GenerateClientInfo,
} from './usageReporting';

export function ApolloServerPluginUsageReporting<TContext extends BaseContext>(
  options: ApolloServerPluginUsageReportingOptions<TContext> = Object.create(
    null,
  ),
): ApolloServerPlugin<TContext> {
  return require('./usageReporting').ApolloServerPluginUsageReporting(options);
}
export function ApolloServerPluginUsageReportingDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('UsageReporting');
}
//#endregion

//#region Schema reporting
import type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';
export type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';

export function ApolloServerPluginSchemaReporting<TContext extends BaseContext>(
  options: ApolloServerPluginSchemaReportingOptions = Object.create(null),
): ApolloServerPlugin<TContext> {
  return require('./schemaReporting').ApolloServerPluginSchemaReporting(
    options,
  );
}
//#endregion

//#region Inline trace
import type { ApolloServerPluginInlineTraceOptions } from './inlineTrace';
export type { ApolloServerPluginInlineTraceOptions } from './inlineTrace';

export function ApolloServerPluginInlineTrace<TContext extends BaseContext>(
  options: ApolloServerPluginInlineTraceOptions = Object.create(null),
): ApolloServerPlugin<TContext> {
  return require('./inlineTrace').ApolloServerPluginInlineTrace(options);
}
export function ApolloServerPluginInlineTraceDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('InlineTrace');
}
//#endregion

//#region Cache control
import type { ApolloServerPluginCacheControlOptions } from './cacheControl';
export type { ApolloServerPluginCacheControlOptions } from './cacheControl';

export function ApolloServerPluginCacheControl<TContext extends BaseContext>(
  options: ApolloServerPluginCacheControlOptions = Object.create(null),
): ApolloServerPlugin<TContext> {
  return require('./cacheControl').ApolloServerPluginCacheControl(options);
}
export function ApolloServerPluginCacheControlDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('CacheControl');
}
//#endregion

//#region Drain HTTP server
import type { ApolloServerPluginDrainHttpServerOptions } from './drainHttpServer';
export type { ApolloServerPluginDrainHttpServerOptions } from './drainHttpServer';
export function ApolloServerPluginDrainHttpServer<TContext extends BaseContext>(
  options: ApolloServerPluginDrainHttpServerOptions,
): ApolloServerPlugin<TContext> {
  return require('./drainHttpServer').ApolloServerPluginDrainHttpServer(
    options,
  );
}
//#endregion

//#region LandingPage
export function ApolloServerPluginLandingPageDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('LandingPageDisabled');
}

import type {
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
} from './landingPage/default/types';
export type {
  ApolloServerPluginLandingPageDefaultBaseOptions,
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
} from './landingPage/default/types';
export function ApolloServerPluginLandingPageLocalDefault<
  TContext extends BaseContext,
>(
  options?: ApolloServerPluginLandingPageLocalDefaultOptions,
): ApolloServerPlugin<TContext> {
  return require('./landingPage/default').ApolloServerPluginLandingPageLocalDefault(
    options,
  );
}
export function ApolloServerPluginLandingPageProductionDefault<
  TContext extends BaseContext,
>(
  options?: ApolloServerPluginLandingPageProductionDefaultOptions,
): ApolloServerPlugin<TContext> {
  return require('./landingPage/default').ApolloServerPluginLandingPageProductionDefault(
    options,
  );
}

import type { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from './landingPage/graphqlPlayground';
export type { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from './landingPage/graphqlPlayground';
export function ApolloServerPluginLandingPageGraphQLPlayground<
  TContext extends BaseContext,
>(
  options: ApolloServerPluginLandingPageGraphQLPlaygroundOptions = Object.create(
    null,
  ),
): ApolloServerPlugin<TContext> {
  return require('./landingPage/graphqlPlayground').ApolloServerPluginLandingPageGraphQLPlayground(
    options,
  );
}
//#endregion
