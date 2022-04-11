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
import type { ApolloServerPlugin, BaseContext } from '@apollo/server-types';
import type {
  InternalApolloServerPlugin,
  InternalPluginId,
} from '../internalPlugin';

function disabledPlugin(id: InternalPluginId): ApolloServerPlugin<BaseContext> {
  const plugin: InternalApolloServerPlugin<BaseContext> = {
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
export function ApolloServerPluginUsageReportingDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('UsageReporting');
}
//#endregion

//#region Schema reporting
import type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';
export type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';

export function ApolloServerPluginSchemaReporting(
  options: ApolloServerPluginSchemaReportingOptions = Object.create(null),
): ApolloServerPlugin<BaseContext> {
  return require('./schemaReporting').ApolloServerPluginSchemaReporting(
    options,
  );
}
//#endregion

//#region Inline trace
import type { ApolloServerPluginInlineTraceOptions } from './inlineTrace';
export type { ApolloServerPluginInlineTraceOptions } from './inlineTrace';

export function ApolloServerPluginInlineTrace(
  options: ApolloServerPluginInlineTraceOptions = Object.create(null),
): ApolloServerPlugin<BaseContext> {
  return require('./inlineTrace').ApolloServerPluginInlineTrace(options);
}
export function ApolloServerPluginInlineTraceDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('InlineTrace');
}
//#endregion

//#region Cache control
import type { ApolloServerPluginCacheControlOptions } from './cacheControl';
export type { ApolloServerPluginCacheControlOptions } from './cacheControl';

export function ApolloServerPluginCacheControl(
  options: ApolloServerPluginCacheControlOptions = Object.create(null),
): ApolloServerPlugin<BaseContext> {
  return require('./cacheControl').ApolloServerPluginCacheControl(options);
}
export function ApolloServerPluginCacheControlDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('CacheControl');
}
//#endregion

//#region Drain HTTP server
import type { ApolloServerPluginDrainHttpServerOptions } from './drainHttpServer';
export type { ApolloServerPluginDrainHttpServerOptions } from './drainHttpServer';
export function ApolloServerPluginDrainHttpServer(
  options: ApolloServerPluginDrainHttpServerOptions,
): ApolloServerPlugin<BaseContext> {
  return require('./drainHttpServer').ApolloServerPluginDrainHttpServer(
    options,
  );
}
//#endregion

//#region LandingPage
export function ApolloServerPluginLandingPageDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('LandingPageDisabled');
}

import type {
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
} from './landingPage/default';
export type {
  ApolloServerPluginLandingPageDefaultBaseOptions,
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
} from './landingPage/default';
export function ApolloServerPluginLandingPageLocalDefault(
  options?: ApolloServerPluginLandingPageLocalDefaultOptions,
): ApolloServerPlugin<BaseContext> {
  return require('./landingPage/default').ApolloServerPluginLandingPageLocalDefault(
    options,
  );
}
export function ApolloServerPluginLandingPageProductionDefault(
  options?: ApolloServerPluginLandingPageProductionDefaultOptions,
): ApolloServerPlugin<BaseContext> {
  return require('./landingPage/default').ApolloServerPluginLandingPageProductionDefault(
    options,
  );
}

import type { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from './landingPage/graphqlPlayground';
export type { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from './landingPage/graphqlPlayground';
export function ApolloServerPluginLandingPageGraphQLPlayground(
  options: ApolloServerPluginLandingPageGraphQLPlaygroundOptions = Object.create(
    null,
  ),
): ApolloServerPlugin<BaseContext> {
  return require('./landingPage/graphqlPlayground').ApolloServerPluginLandingPageGraphQLPlayground(
    options,
  );
}
//#endregion
