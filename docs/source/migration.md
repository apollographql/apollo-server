---
title: Migrating to v3.0
description: How to migrate to Apollo Server 3.0
---

## Subscriptions

> *Note:* Currently, these instructions are only for the Express integration.
> Things are likely similar for other integrations.  PRs to this migration guide
> are certainly welcome!
>
> If you are using `apollo-server` directly, please eject to the Express
> integration first using the instructions elsewhere in our documentation.
> TODO: Provide link here.

 1. Install `subscriptions-transport-ws`

        npm install subscriptions-transport-ws

 2. Install `graphql-tools` version 4.0.0.

        npm install graphql-tools@4.x

 3. Import the `SubscriptionServer` from `subscriptions-transport-ws`

    ```javascript
    import { SubscriptionServer } from 'subscriptions-transport-ws'
    ```

 4. Import `makeExecutableSchema` from `graphql-tools`

    > Your server may already be using `makeExecutableSchema`, so adding this
    > import may not be necessary.  More on why and how in the next step!

    ```javascript
    import { makeExecutableSchema } from 'graphql-tools'
    ```

 5. Import the `execute` and `subscribe` functions from `graphql`.

    The `graphql` package should already be installed, so simply import them for
    usage:

    ```javascript
    import { execute, subscribe } from 'graphql';
    ```

    We will pass these to the creation of the `SubscriptionServer` in Step 9.

 6. Have an instance of the executable schema available.

    The `SubscriptionServer` (which we'll initiate in a later step) doesn't
    accept `typeDefs` and `resolvers` directly (but instead only accepts an
    executable `schema`) it's necessary to pass your `typeDefs` and
    `resolvers` to `makeExecutableSchema` in order to have the `schema` to
    pass in.

    > Your server may already use `makeExecutableSchema`.  If it does, this step
    > can be skipped.  You'll use the result of your existing schema in
    > Step TODO below.

    ```javascript
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    ```

    > While not necessary, this `schema` can be passed into the `ApolloServer`
    > constructor options, rather than `typeDefs` and `resolvers`:
    >
    > ```javascript
    > const server = new ApolloServer({
    >   schema,
    > });
    > ```

 7. Import Node.js's `createServer` from the `http` module.

    ```javascript
    import { createServer } from 'http';
    ```

 8. Make GraphQL Playground aware of the subscription server endpoint

    We'll pass the Playground URI endpoint to the Playground configuration
    which can be defined on the `ApolloServer` constructor options:

    ```javascript
    const server = new ApolloServer({
       /* Existing options */

       playground: {
          // Adjust this URL accordingly, of course!
          // This might be hard to use existing variables for, since they
          // are available _after_ construction of this `ApolloServer` instance.
          //
          // In theory, with Apollo Server, Playground *could* safely assume
          // use of `ws://` in place of `https://` for subscription requests
          // but I don't think it does that.
          subscriptionEndpoint: 'ws://localhost:4000/graphql',
       },

    })
    ```

  9. Get an `http.Server` instance with the Express app, prior to `listen`-ing.

     In order to setup both the HTTP and WebSocket servers prior to listening,
     we'll need to get the `http.Server`.  Do this by passing the Express `app`
     to the `createServer` we imported from Node.js' `http` module.

     ```javascript
     // This `app` is the returned value from `express()`.
     const httpServer = createServer(app);
     ```

10. Create the `SubscriptionsServer`

    ```javascript
    SubscriptionServer.create({
       // This is the `schema` created in Step 6 above.
       schema,

       // These were imported from `graphql` in Step 5 above.
       execute,
       subscribe,
    }, {
       // This is the `httpServer` created in Step 9 above.
       server: httpServer,

       // This `server` is the instance returned from `new ApolloServer`.
       path: server.graphqlPath,
    });
    ```

11. Finally, adjust the existing `listen`.

    Previously, most applications will be doing `app.listen(...)`.

    **This should be changed to `httpServer.listen(...)`** (same arguments) to
    start listening on the HTTP and WebSocket transports simultaneously.

## File uploads

1. Install `graphql-upload`

       npm install graphql-upload

2. Import the necessary primitives from `graphql-upload`

   ```javascript
   import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
   ```

3. Add the `Upload` scalar to the schema

   ```graphql
   scalar Upload
   ```

4. Add a resolver for the `Upload` scalar

   ```javascript
   const resolvers = {
     // Add this line to use the `GraphQLUpload` from `graphql-upload`.
     Upload: GraphQLUpload,

     /*
	...
	Other resolvers remain the same.
	...
     */

   },
   ```

5. Add the `graphql-upload` middleware

   Add the `graphqlUploadExpress` middleware _before_ calling into
   the `applyMiddleware` method with the `app`.

   ```js
   const app = express(); // Existing.
   app.use(graphqlUploadExpress()); // New!
   server.applyMiddleware({ app }); // Existing.
   ```
