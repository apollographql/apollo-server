// This is the UI plugin for GraphQL Playground. It wraps
// `@apollographql/graphql-playground-html`, our fork of upstream Playground.
// That package just contains a small HTML shell that brings in the actual React
// app from a CDN; you can control what version of the React app to use by
// specifying `version` when installing the plugin.

import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import type { ImplicitlyInstallablePlugin } from '../../../ApolloServer';

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
const defaultPlaygroundVersion = '1.7.41';

export type ApolloServerPluginUIGraphQLPlaygroundOptions = Parameters<
  typeof renderPlaygroundPage
>[0];

export function ApolloServerPluginUIGraphQLPlayground(
  options: ApolloServerPluginUIGraphQLPlaygroundOptions = Object.create(null),
): ImplicitlyInstallablePlugin {
  return {
    __internal_installed_implicitly__: false,
    serverWillStart() {
      return {
        renderUIPage() {
          return {
            html: renderPlaygroundPage({
              version: defaultPlaygroundVersion,
              ...options,
            }),
          };
        },
      };
    },
  };
}
