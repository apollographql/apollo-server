// This file exports the "disabled" version of various plugins which are
// installed by default under certain circumstances. This lets users explicitly
// choose not to enable these plugins. Note that we explicitly keep these tiny
// plugins separate from the plugins they are enabling; this means that we don't
// have to load (say) the entire `plugin/usageReporting` entry point (which
// includes the whole generated protobuf library, etc) just in order to disable
// usage reporting.

import type { BaseContext, ApolloServerPlugin } from '../../index.js';
import type {
  InternalApolloServerPlugin,
  InternalPluginId,
} from '../../internalPlugin.js';

function disabledPlugin(id: InternalPluginId): ApolloServerPlugin {
  const plugin: InternalApolloServerPlugin<BaseContext> = {
    __internal_plugin_id__: id,
    __is_disabled_plugin__: true,
  };
  return plugin;
}

export function ApolloServerPluginCacheControlDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('CacheControl');
}

export function ApolloServerPluginInlineTraceDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('InlineTrace');
}

export function ApolloServerPluginLandingPageDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('LandingPageDisabled');
}

export function ApolloServerPluginSchemaReportingDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('SchemaReporting');
}

export function ApolloServerPluginUsageReportingDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('UsageReporting');
}
