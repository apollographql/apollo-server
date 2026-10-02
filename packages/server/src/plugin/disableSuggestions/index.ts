import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import { internalPlugin } from '../../internalPlugin.js';
import { Kind } from 'graphql';

// GraphQL 17 may append the invalid input value after the suggestion.
const DID_YOU_MEAN_SUFFIX = / ?Did you mean(.+?)\?(?= Found: |$)/;

function stripDidYouMeanSuggestion(error: { message: string; stack?: string }) {
  const message = error.message.replace(DID_YOU_MEAN_SUFFIX, '');
  if (message === error.message) {
    return;
  }
  error.message = message;
  if (error.stack) {
    const [stackMessage, ...frames] = error.stack.split('\n');
    error.stack = [
      stackMessage.replace(DID_YOU_MEAN_SUFFIX, ''),
      ...frames,
    ].join('\n');
  }
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
          // Variable coercion errors never pass through validationDidStart.
          errors
            .filter(
              (error) =>
                error.nodes?.length === 1 &&
                error.nodes[0].kind === Kind.VARIABLE_DEFINITION,
            )
            .forEach(stripDidYouMeanSuggestion);
        },
      };
    },
  });
}
