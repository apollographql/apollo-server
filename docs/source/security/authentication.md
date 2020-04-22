---
title: Authentication
description: How to authorize users and control permissions in your GraphQL API
---

At some point (probably pretty early on) when building a GraphQL endpoint, you’ll probably have to face the question of how to control who can see and interact with the data in your API.

**Authentication** is determining whether a user is logged in or not, and subsequently figuring out _which_ user someone is. **Authorization** is then deciding what the user has permission to do or see.

This article will primarily be focusing on how to set up authorization for your schema once you know about the user trying to make the request, but we’ll go through one example of authentication just to get some _context_ for what we’re doing.

## Putting user info on the context

Before we get into figuring out user permissions, we have to figure out how to recognize a user first. From HTTP headers, to JSON web tokens, there are a number of ways to handle authentication of users, but once you have your user, controlling access looks pretty similar.

We’ll be using a login token in an HTTP authorization header as an example.

```js
// using apollo-server 2.x
const { ApolloServer } = require('apollo-server');

const server = new ApolloServer({
 typeDefs,
 resolvers,
 context: ({ req }) => {
   // Note! This example uses the `req` object to access headers,
   // but the arguments received by `context` vary by integration.
   // This means they will vary for Express, Koa, Lambda, etc.!
   //
   // To find out the correct arguments for a specific integration,
   // see the `context` option in the API reference for `apollo-server`:
   // https://www.apollographql.com/docs/apollo-server/api/apollo-server/

   // Get the user token from the headers.
   const token = req.headers.authorization || '';

   // try to retrieve a user with the token
   const user = getUser(token);

   // add the user to the context
   return { user };
 },
});

server.listen().then(({ url }) => {
 console.log(`🚀 Server ready at ${url}`)
});
```

So what’s happening here, exactly? This block of code is setting up a new GraphQL server, using Apollo Server 2.0. This new version of Apollo Server simplifies the API for creating new servers, and has some more intelligent defaults. You can read more about it [here](https://blog.apollographql.com/apollo-server-2-0-30c9bbb4ab5e)!

In this constructor, we pass type definitions and resolvers to the constructor as well as a function to build our `context` object. The `context` object is one that gets passed to every single resolver at every level, so we can access it anywhere in our schema code. It’s where we can store things like data fetchers, database connections, and (conveniently) information about the user making the request.

Since the context is generated again with every new request, we don’t have to worry about cleaning up user data at the end of execution.

The context function here looks at the request headers, pulls off the header named `authorization`, and stores it to a variable. It then calls a `getUser` function with that token, and expects a user to be returned if the token is valid. After that, it returns a context object containing the (potential) user, for all of our resolvers to use.

The specifics of retrieving a user will look different for each method of authentication, but the final part will look about the same every time. The authorization needs for your schema may require you to put nothing more than `{ loggedIn: true }` into context, but also may require an id or roles, like `{ user: { id: 12345, roles: ['user', 'admin'] } }`.

In the next section, we’ll look at ways to use the user information we now have to secure your schema.

## Schema authorization

Once we have information about the user making a request, the most basic thing we can do is deny them the ability to run a query at all based on their roles. This is an all-or-nothing approach to authorization that we’ll start with because it’s the simplest. If you choose to block users like this, no fields will be publicly queryable.

We would want to do this only on very restrictive environments where there is no public access to the schema or any fields, like an internal tool or maybe an independent micro service that we don’t want exposed to the public.

To do this kind of authorization, we can just modify the context function.

```js
context: ({ req }) => {
 // get the user token from the headers
 const token = req.headers.authorization || '';

 // try to retrieve a user with the token
 const user = getUser(token);

 // optionally block the user
 // we could also check user roles/permissions here
 if (!user) throw new AuthenticationError('you must be logged in'); 

 // add the user to the context
 return { user };
},
```

The only difference from the basic context function is the check for the user. If no user exists or if lookup fails, the function throws an error, and none of the query gets executed.

## Authorization in resolvers

Schema authorization may be useful in specific instances, but more commonly, GraphQL schemas will have some fields that need to be public. An example of this would be a news site that wants to show article previews to anyone, but restrict the full body of articles to paying customers only.

Luckily, GraphQL offers very granular control over data. In GraphQL servers, individual field resolvers have the ability to check user roles and make decisions as to what to return for each user. In the previous sections, we saw how to attach user information to the context object. In the rest of the article, we’ll discuss how to use that context object.

For our first example, let’s look at a resolver that’s only accessible with a valid user:

```js
users: (parent, args, context) => {
 // In this case, we'll pretend there is no data when
 // we're not logged in. Another option would be to
 // throw an error.
 if (!context.user) return null;

 return ['bob', 'jake'];
}
```

This example is a field in our schema named `users` that returns a list of users’ names. The `if` check on the first line of the function looks at the `context` generated from our request, checks for a `user` object, and if one doesn’t exist, returns `null` for the whole field.

One choice to make when building out our resolvers is what an unauthorized field should return. In some use cases, returning `null` here is perfectly valid. Alternatives to this would be to return an empty array, `[]` or to throw an error, telling the client that they’re not allowed to access that field. For the sake of simplicity, we just returned `null` in this example.

Now let’s expand that example a little further, and only allow users with an `admin` role to look at our user list. After all, we probably don’t want just anyone to have access to all our users.

```js
users: (parent, args, context) => {
 if (!context.user || !context.user.roles.includes('admin')) return null;
 return context.models.User.getAll();
}
```

This example looks almost the same as the previous one, with one addition: it expects the `roles` array on a user to include an `admin` role. Otherwise, it returns `null`. The benefit of doing authorization like this is that we can short-circuit our resolvers and not even call lookup functions when we don’t have permission to use them, limiting the possible errors that could expose sensitive data.

Because our resolvers have access to everything in the context, an important question we need to ask is how much information we want in the context. For example, we don’t need the user’s id, name, or age (at least not yet). It’s best to keep things out of the context until they’re needed, since they’re easy to add back in later.

## Authorization in data models

As our server gets more complex, there will probably be multiple places in the schema that need to fetch the same kind of data. In our last example, you may have noticed the return array was replaced with a call to `context.models.User.getAll()`.

Since the very beginning, [we’ve recommended](https://www.apollographql.com/docs/graphql-tools/connectors.html) moving the actual data fetching and transformation logic from resolvers to centralized Model objects that each represent a concept from your application: User, Post, etc. This allows you to make your resolvers a thin routing layer, and put all of your business logic in one place.

For example, a model file for `User` would include all the logic for operating on users, and may look something like…

```js
export const User = {
 getAll: () => { /* fetching/transform logic for all users */ },
 getById: (id) => { /* fetching/transform logic for a single user */ },
 getByGroupId: (id) => { /* fetching/transform logic for a group of users */ },
};
```

In the following example, our schema has multiple ways to request a single user…

```js
type Query {
 user (id: ID!): User
 article (id: ID!): Article
}

type Article {
 author: User
}

type User {
 id: ID!
 name: String!
}
```

Rather than having the same fetching logic for a single user in two separate places, it usually makes sense to move that logic to the model file. You may have guessed, with all this talk of model files in an authorization article, that authorization is another great thing to delegate to the model, just like data fetching. You would be right.

**Delegating authorization to models**

You may have noticed that our models also exist on the context, alongside the user object we added earlier. We can add the models to the context in exactly the same way as we did the user.

```js
context: ({ req }) => {
 // get the user token from the headers
 const token = req.headers.authentication || '';
  
 // try to retrieve a user with the token
 const user = getUser(token);

 // optionally block the user
 // we could also check user roles/permissions here
 if (!user) throw new AuthenticationError('you must be logged in to query this schema');  

 // add the user to the context
 return {
   user,
   models: {
     User: generateUserModel({ user }),
     ...
   }
 };
},
```

Starting to generate our models with a function requires a small refactor, that would leave our User model looking something like this:

```js
export const generateUserModel = ({ user }) => ({
 getAll: () => { /* fetching/transform logic for all users */ },
 getById: (id) => { /* fetching/transform logic for a single user */ },
 getByGroupId: (id) => { /* fetching/transform logic for a group of users */ },
});
```

Now any model method in `User` has access to the same `user` information that resolvers already had, allowing us to refactor the `getAll` function to do the permissions check directly rather than having to put it in the resolver:

```js
getAll: () => {
 if(!user || !user.roles.includes('admin')) return null;
 return fetch('http://myurl.com/users');
}
```

## Authorization via Custom Directives

Another way to go about authorization is via GraphQL Schema Directives. A directive is an identifier preceded by a `@` character, optionally followed by a list of named arguments, which can appear after almost any form of syntax in the GraphQL query or schema languages.

Check out this example of an authorization directive:

```js
const typeDefs = `
  directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    REVIEWER
    USER
  }

  type User @auth(requires: USER) {
    name: String
    banned: Boolean @auth(requires: ADMIN)
    canPost: Boolean @auth(requires: REVIEWER)
  }
`
```

The `@auth` directive can be called directly on the type, or on the fields if you want to limit access to specific fields as shown in the example above. The logic behind authorization is hidden away in the directive implementation. 

One way of implementing the `@auth` directive is via the [SchemaDirectiveVisitor](https://www.apollographql.com/docs/graphql-tools/schema-directives.html) class from [graphql-tools](https://github.com/apollographql/graphql-tools). Ben Newman covered creating a sample `@deprecated` and `@rest` directive in this [excellent article](https://blog.apollographql.com/reusable-graphql-schema-directives-131fb3a177d1). You can draw inspiration from these examples.

## Authorization outside of GraphQL

If you’re using a REST API that has built-in authorization, like with an HTTP header, you have one more option. Rather than doing any authentication or authorization work in the GraphQL layer (in resolvers/models), it’s possible to simply pass through the headers or cookies to your REST endpoint and let it do the work.

Here’s an example:

```js
// src/server.js
context: ({ req }) => {
 // pass the request information through to the model
 return {
   user,
   models: {
     User: generateUserModel({ req }),
     ...
   }
 };
},
```

```js
// src/models/user.js
export const generateUserModel = ({ req }) => ({
 getAll: () => {
   return fetch('http://myurl.com/users', { headers: req.headers });
 },
});
```

If your REST endpoint is already backed by some form of authorization, this cuts down a lot of the logic that needs to get built in the GraphQL layer. This can be a great option when building a GraphQL API over an existing REST API that has everything you need already built in.
