// TODO(AS4): Document this file
// TODO(AS4): Decide where it is imported from.
import type { BaseContext, ApolloServerPlugin } from '..';
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

export function ApolloServerPluginCacheControlDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('CacheControl');
}

export function ApolloServerPluginInlineTraceDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('InlineTrace');
}

export function ApolloServerPluginLandingPageDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('LandingPageDisabled');
}

export function ApolloServerPluginUsageReportingDisabled<
  TContext extends BaseContext,
>(): ApolloServerPlugin<TContext> {
  return disabledPlugin('UsageReporting');
}
