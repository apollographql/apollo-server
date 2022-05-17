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

//#region Usage reporting
import type { ApolloServerPluginUsageReportingOptions } from './usageReporting';
export type {
  ApolloServerPluginUsageReportingOptions,
  SendValuesBaseOptions,
  VariableValueOptions,
  ClientInfo,
  GenerateClientInfo,
} from './usageReporting';

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
//#endregion

//#region Schema reporting
import type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';
export type { ApolloServerPluginSchemaReportingOptions } from './schemaReporting';

export function ApolloServerPluginSchemaReporting(
  options: ApolloServerPluginSchemaReportingOptions = Object.create(null),
): ApolloServerPlugin {
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
): ApolloServerPlugin {
  return require('./inlineTrace').ApolloServerPluginInlineTrace(options);
}
export function ApolloServerPluginInlineTraceDisabled(): ApolloServerPlugin {
  return require('./inlineTrace').ApolloServerPluginInlineTraceDisabled();
}
//#endregion

//#region Cache control
import type { ApolloServerPluginCacheControlOptions } from './cacheControl';
export type { ApolloServerPluginCacheControlOptions } from './cacheControl';

export function ApolloServerPluginCacheControl(
  options: ApolloServerPluginCacheControlOptions = Object.create(null),
): ApolloServerPlugin {
  return require('./cacheControl').ApolloServerPluginCacheControl(options);
}
export function ApolloServerPluginCacheControlDisabled(): ApolloServerPlugin {
  return require('./cacheControl').ApolloServerPluginCacheControlDisabled();
}
//#endregion

//#region Drain HTTP server
import type { ApolloServerPluginDrainHttpServerOptions } from './drainHttpServer';
export type { ApolloServerPluginDrainHttpServerOptions } from './drainHttpServer';
export function ApolloServerPluginDrainHttpServer(
  options: ApolloServerPluginDrainHttpServerOptions,
): ApolloServerPlugin {
  return require('./drainHttpServer').ApolloServerPluginDrainHttpServer(
    options,
  );
}
//#endregion

//#region LandingPage
import type { InternalApolloServerPlugin } from '../internalPlugin';
export function ApolloServerPluginLandingPageDisabled(): ApolloServerPlugin {
  const plugin: InternalApolloServerPlugin = {
    __internal_plugin_id__() {
      return 'LandingPageDisabled';
    },
  };
  return plugin;
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
export function ApolloServerPluginLandingPageLocalDefault(
  options?: ApolloServerPluginLandingPageLocalDefaultOptions,
): ApolloServerPlugin {
  return require('./landingPage/default').ApolloServerPluginLandingPageLocalDefault(
    options,
  );
}
export function ApolloServerPluginLandingPageProductionDefault(
  options?: ApolloServerPluginLandingPageProductionDefaultOptions,
): ApolloServerPlugin {
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
): ApolloServerPlugin {
  return require('./landingPage/graphqlPlayground').ApolloServerPluginLandingPageGraphQLPlayground(
    options,
  );
}
//#endregion
