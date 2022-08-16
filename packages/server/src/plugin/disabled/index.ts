// TODO(AS4): Document this file
// TODO(AS4): Decide where it is imported from.
import type { BaseContext, ApolloServerPlugin } from '../..';
import type {
  InternalApolloServerPlugin,
  InternalPluginId,
} from '../../internalPlugin';

function disabledPlugin(id: InternalPluginId): ApolloServerPlugin {
  const plugin: InternalApolloServerPlugin<BaseContext> = {
    __internal_plugin_id__() {
      return id;
    },
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

export function ApolloServerPluginUsageReportingDisabled(): ApolloServerPlugin<BaseContext> {
  return disabledPlugin('UsageReporting');
}
