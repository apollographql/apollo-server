// FIXME doc
import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';

import { HtmlPagesOptions } from 'apollo-server-plugin-base';

import { InternalApolloServerPlugin } from '../../../internalPlugin';

// This specifies the React version of our fork of GraphQL Playground,
// `@apollographql/graphql-playground-react`.  It is related to, but not to
// be confused with, the `@apollographql/graphql-playground-html` package which
// is a dependency of Apollo Server's various integration `package.json`s files.
//
// The HTML (stub) file renders a `<script>` tag that loads the React (guts)
// from a CDN URL on jsdelivr.com, which allows serving of files from npm packages.
//
// The version is passed to `@apollographql/graphql-playground-html`'s
// `renderPlaygroundPage` via the integration packages' `playground` config.
const defaultPlaygroundVersion = '1.7.40';

export type ApolloServerPluginUIGraphQLPlaygroundOptions =
  Parameters<typeof renderPlaygroundPage>[0]
;

export function ApolloServerPluginUIGraphQLPlayground(
  options: ApolloServerPluginUIGraphQLPlaygroundOptions = Object.create(null),
): InternalApolloServerPlugin {
  return {
    __internal_plugin_id__() {
      return 'UI';
    },
    serverWillStart() {
      return {
        htmlPages({ graphqlPath }: HtmlPagesOptions) {
          return [
            {
              path: '/ui/playground',
              html: renderPlaygroundPage({
                version: defaultPlaygroundVersion,
                endpoint: graphqlPath,
                ...options,
              }),
              redirectFromRoot: true,
            },
          ];
        },
      };
    },
  };
}
