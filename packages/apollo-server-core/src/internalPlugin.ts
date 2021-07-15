import type { BaseContext } from 'apollo-server-types';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

// This file's exports should not be exported from the overall
// apollo-server-core module.

// The internal plugins implement this interface which
// ApolloServer.ensurePluginInstantiation uses to figure out if the plugins have
// already been installed (or explicitly disabled via the matching Disable
// plugins).
export interface InternalApolloServerPlugin<
  TContext extends BaseContext = BaseContext,
> extends ApolloServerPlugin<TContext> {
  // Used to identify a few specific plugins that are instantiated
  // by default if not explicitly used or disabled.
  __internal_plugin_id__(): InternalPluginId;
}

export type InternalPluginId =
  | 'CacheControl'
  | 'LandingPageDisabled'
  | 'SchemaReporting'
  | 'InlineTrace'
  | 'UsageReporting';

export function pluginIsInternal(
  plugin: ApolloServerPlugin,
): plugin is InternalApolloServerPlugin {
  // We could call the function and compare it to the list above, but this seems
  // good enough.
  return '__internal_plugin_id__' in plugin;
}
