import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import { internalPlugin } from '../../internalPlugin.js';

export function ApolloServerPluginDisableSuggestions(): ApolloServerPlugin {
  return internalPlugin({
    __internal_plugin_id__: 'DisableSuggestions',
    __is_disabled_plugin__: false,
    async requestDidStart() {
      return {
        async validationDidStart() {
          return async (validationErrors) => {
            validationErrors?.forEach((error) => {
              error.message = error.message.replace(
                / ?Did you mean(.+?)\?$/,
                '',
              );
            });
          };
        },
      };
    },
  });
}
