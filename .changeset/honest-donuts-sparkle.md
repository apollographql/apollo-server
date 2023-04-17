---
'@apollo/server': minor
---

In the Apollo Server Landing Page Local config, you can now opt out of the telemetry that Apollo Studio runs in the
embedded Sandbox & Explorer landing pages. This telemetry includes Google Analytics for event tracking and
Sentry for error tracking.

Example of the new config option:

```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageProductionDefault({
          graphRef: 'my-graph-id@my-graph-variant',
          embed: {
            runTelemetry: false
          },
        })
      : ApolloServerPluginLandingPageLocalDefault({
          embed: {
            runTelemetry: false
          },
        }),
  ],
});
