# GraphQL Playground plugin

> ⚠️ Note: this package will be completely unsupported when Apollo Server v4 is officially released. This package exists for migration purposes only. We do not intend to resolve security issues or other bugs with this package if they arise, so please migrate away from this to Apollo Server's default Explorer as soon as possible. ⚠️

This is a plugin for Apollo Server 4 that makes your GraphQL server serve the [GraphQL Playground IDE](https://github.com/graphql/graphql-playground) as a landing page.

GraphQL Playground was the only landing page available for Apollo Server 2. The GraphQL Playground project is officially [retired](https://github.com/graphql/graphql-playground/issues/1143) and we do not recommend its continued use. We recommend Apollo Server 4's default landing page, which serves the similar but actively maintained [Apollo Sandbox](https://www.apollographql.com/docs/studio/explorer/sandbox/), or a custom landing page.

To help developers migrating from Apollo Server 2, we do still provide a landing page plugin that allows you to use GraphQL Playground with Apollo Server. In Apollo Server 3, that plugin is distributed as part of the `apollo-server-core` package. In Apollo Server 4, that plugin is distributed separately in this package.

To use GraphQL Playground with Apollo Server 4, first `npm install @apollo/server-plugin-landing-page-graphql-playground`, and then:

```ts
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';

const server = new ApolloServer({
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  // ... other options ...
});
```

Note that this will serve GraphQL Playground unconditionally. If you would prefer to only serve it when not in production, you can use `process.env.NODE_ENV` to determine whether to include the plugin in the `plugins` option yourself.
