---
'@apollo/server': minor
---

In the Apollo Server Landing Page Local config, you can now automatically turn off autopolling on your endpoints as well as pass headers used to introspect your schema, embed an operation from a collection, and configure whether the endpoint input box is editable. In the Apollo Server Landing Page Prod config, you can embed an operation from a collection & we fixed a bug introduced in release 4.4.0

Example of all new config options: 

```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageProductionDefault({
          graphRef: 'my-graph-id@my-graph-variant',
          collectionId: 'abcdef',
          operationId: '12345'
          embed: true,
          footer: false,
        })
      : ApolloServerPluginLandingPageLocalDefault({
          collectionId: 'abcdef',
          operationId: '12345'
          embed: {
            initialState: {
              pollForSchemaUpdates: false,
              sharedHeaders: {
                "HeaderNeededForIntrospection": "ValueForIntrospection"
              },
            },
            endpointIsEditable: true,
          },
          footer: false,
        }),
  ],
});

```
