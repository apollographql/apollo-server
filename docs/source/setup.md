---
title: Adding a GraphQL endpoint
description: Detailed directions about adding a GraphQL endpoint and passing options.
---

Apollo Server has a slightly different API depending on which server integration you are using, but all of the packages share the same core implementation and options format.

If you want to get started quickly, check out the [complete starter code snippet](/v1/example/).

## Passing options

Apollo Server accepts a `GraphQLOptions` object as its single argument, like so (for Express):

```js
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({
    schema: myGraphQLSchema,
    // other options here
  }),
);
```

### Options as a function

If you need to vary the options on a per-request basis, the options can also be passed as a function, in which case you get the `req` object or similar as an argument:

```js
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => {
    return {
      schema: myGraphQLSchema,
      context: {
        value: req.body.something,
      },
      // other options here
    };
  }),
);
```

This is useful if you need to attach objects to your context on a per-request basis, for example to initialize user data, caching tools like `dataloader`, or set up some API keys.

## Options API

The `GraphQLOptions` object has the following properties:

### schema

The GraphQL.js schema object that represents your GraphQL schema. You can create this directly using [GraphQL.js](https://github.com/graphql/graphql-js), the reference GraphQL implementation, or you can use graphql-tools, which makes it simple to combine a schema and resolvers. [See an example.](/v1/example/)

### context

The context is an object that's accessible in every single resolver as the third argument. This is a great place to pass information that depends on the current request. Read more about resolvers and their arguments in the [graphql-tools docs](https://www.apollographql.com/docs/graphql-tools/resolvers/#Resolver-function-signature). Here's an example:

```js
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => {
    // Some sort of auth function
    const userForThisRequest = getUserFromRequest(req);

    return {
      schema: myGraphQLSchema,
      context: {
        user: userForThisRequest,
      },
      // other options here
    };
  }),
);
```

#### Passing context as a function

The value passed to `context` can also be a function. [No arguments are passed the function](https://github.com/apollographql/apollo-server/blob/df51fd90dad90c9468a74e2c4ec2a6af69f4188d/packages/apollo-server-core/src/runHttpQuery.ts#L138-L139), but this can be useful for constructing a new context on each request (for example, creating a new instance of a class).

```js
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({
    schema: myGraphQLSchema,
    context: () => ({
      // Create a new instance of the user class for each request
      user: new User(),
    }),
    // other options here
  }),
);
```

### rootValue

This is the value passed as the `obj` argument into the root resolvers. Read more about resolvers and their arguments in the [graphql-tools docs](https://www.apollographql.com/docs/graphql-tools/resolvers/#Resolver-function-signature). Note: This feature is not often used, since in most cases `context` is a better option to pass per-request data into resolvers.

### formatError

A function to format errors before they are returned to the client. GraphQL does some processing on errors by default, and this is a great place to customize that. You can also access the original thrown error on the `.originalError` property:

```js
formatError: err => {
  if (err.originalError && err.originalError.error_message) {
    err.message = err.originalError.error_message;
  }

  return err;
};
```

### Other options

The above are the only options you need most of the time. Here are some others that can be useful as workarounds for various situations:

```js
// options object
const GraphQLOptions = {
  // a function applied to the parameters of every invocation of runQuery
  formatParams?: Function,

  // * - (optional) validationRules: extra validation rules applied to requests
  validationRules?: Array<ValidationRule>,

  // a function applied to each GraphQL execution result
  formatResponse?: Function

  // a custom default field resolver
  fieldResolver?: Function

  // a boolean that will print additional debug logging if execution errors occur
  debug?: boolean
}
```

<a name="graphqlExpress"></a>
<a name="graphqlConnect"></a>
<a name="graphqlHapi"></a>
<a name="graphqlKoa"></a>

## Docs for specific servers

To see how to use the middleware with your particular JavaScript server, check out the docs for those:

* [Express / Connect](/v1/servers/express/)
* [Hapi](/v1/servers/hapi/)
* [Koa](/v1/servers/koa/)

And more are being added every day!
