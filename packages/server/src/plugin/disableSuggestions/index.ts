import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import { internalPlugin } from '../../internalPlugin.js';

const DID_YOU_MEAN_SUFFIX = / ?Did you mean(.+?)\?$/;

function stripDidYouMeanSuggestion(error: { message: string }) {
  error.message = error.message.replace(DID_YOU_MEAN_SUFFIX, '');
}

export function ApolloServerPluginDisableSuggestions(): ApolloServerPlugin {
  return internalPlugin({
    __internal_plugin_id__: 'DisableSuggestions',
    __is_disabled_plugin__: false,
    async requestDidStart() {
      return {
        async validationDidStart() {
          return async (validationErrors) => {
            validationErrors?.forEach(stripDidYouMeanSuggestion);
          };
        },
        async didEncounterErrors({ errors }) {
          // Variable coercion (and other execute-time input errors) never pass
          // through validationDidStart, so also strip suggestions here.
          errors?.forEach(stripDidYouMeanSuggestion);
        },
      };
    },
  });
}
