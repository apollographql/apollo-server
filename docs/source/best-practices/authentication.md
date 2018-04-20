---
title: Authentication and Authorization
description: Securing your app and serving your users
---

Intro note about authentication vs authorization and how you don't need to throw everything out

## Background: Authentication vs. Authorization

Authentication describes process that a user proves their identity, meaning they are who the server understands them to be. In most systems, a user and server share a handshake and token that uniquely pairs them together, ensuring both sides know they are communicating with their intended target.

Once an entity or user is authenticated, the server generally defines a scope of access for that user, such as admin(ex: editor) or user(ex: reader). This scope defines what an entity is authorized to do.

## Authentication and Authorization in GraphQL

GraphQL offers similar authentication and authorization mechanics as REST and other data fetching solutions with the possibility to control more fine grain access within a single request. There are two common approaches: whole query authentication and partial query authentication. Whole query authentication follows a similar guidance to REST, where the entire request and response is checked for an authenticated user and authorized to access the servers data. A partial query approach takes advantage of the flexibility of GraphQL to provide public portions of the schema that don't require any authentication and private portions that require authentication and authorization.

## Authenticating users

All of the approaches require that users be authenticated with the server. If you system already has login method setup to authenticate users and provide credentials that can be used in subsequent requests, you can use this same system to authenticate GraphQL requests. With that said, if you are creating a new infrastructure for user authentication, you can follow the existing best practice to authenticate users for REST endpoints, treating your /grpahql endpoint as a rest endpoint. For a full example of authentication, follow [this example](), which uses passport.js.

## Whole Query Authentication

Whole query authentication is useful for GraphQL endpoints that require known users and allow access to all fields inside of a GraphQL endpoint. This approach is useful for internal applications, which are used by a group that is known and generally trusted. Additionally it's common to have separate GraphQL services for different features or products that entirely available to users, meaning if a user is authenticated, they are authorized to access all the data. Since whole query authentication does not need to be aware of the GraphQL layer, your server can add a middleware in front of the GrpahQL layer to ensure authentication. With the authentication example, the implementation of whole query caching would appear as follows:

```js
//authenticate all routes
app.use((req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).send({
      success: false,
      message: 'You need to be authenticated to access this page!',
    });
  } else {
    next();
  }
});

new ApolloServer({ typedefs, resolvers, app }).listen().then(({ url }) => {
  console.log(`Go to ${url} to run queries!`);
});
```

Currently this server will allow any authenticated user to request all fields in the schema, which means that authorization is all or nothing. While some applications provide a shared view of the data to all users, many use cases require scoping authorizations and limiting what some users can see. The authentication scope is shared across all resolvers, so this code adds the user id and scope to the context.

```js
import { DB } from './schema/db.js';

new ApolloServer(req => ({
  typedefs,
  resolvers,
  context: async () => ({
    user_id: req.user.id,
    scope: await DB.Users.getScopeById(req.user.id),
  }),
  app,
}))
  .listen()
  .then(({ url }) => {
    console.log(`Go to ${url} to run queries!`);
  });
```

Now with in a resolver, we are able to check the user's scope. If the user is not an administrator and `allTodos` are requested, a GraphQL specific forbidden error is thrown. Apollo Server will handle associate the error with the particular path and return it along with any other data successfully requested, such as `myTodos`, to the client.

```js
import { ForbiddenError } from 'apollo-server';

const typeDefs = `
  type Query {
    allTodos: [String]
    myTodos: [String]
  }
`;

const resolvers = {
  Query: {
    allTodos: (_, _, context) => {
      if(context.scope !== ADMIN)
        throw ForbiddenError('Need Administrator Privileges');
      return DB.Todos.getAll();
    },
    myTodos: (_, _, context) => {
      return DB.Todos.getById(context.user_id);
    },
  }
}
```

> Note: the actual database implementation is factored out into another file. This follow the DRY mantra, since the same fetch can occur in multiple places.It provides an interface into the data, so the backend can change. Additionally the interface limits resolvers complexity from needing to make calls such as:`sql.raw("SELECT * FROM todos WHERE owner_id is NULL or owner_id = %s", context.user_id);`.

The major downside to whole query authentication is that all requests must be authenticated, which prevents unauthenticated requests to access information that should be publicly accessible, such as a home page. The next approach, partial query authentication enables a portion of the schema to be unauthenticated and authorize portions of the schema to authenticated users.

## Partial Query Authentication

Partial query authentication removes the catch all middleware that throws an unauthenticated error, moving the authentication check within resolvers. The instantiation of the server becomes:

```js
new ApolloServer({ typedefs, resolvers, app }).listen().then(({ url }) => {
  console.log(`Go to ${url} to run queries!`);
});
```

The model for checking authorization mirrors the whole query checks for
authorization scope, making a check for some form of authentication for fields
that require it. In this example, the errors thrown on authentication failures
vs forbidden accesses are different, since the client will take two distinct actions depending on the error, either reauthenticate in the case of an authentication failure or hide the result.

```js
import { ForbiddenError, AuthenticationError } from 'apollo-server';

const typeDefs = `
  type Query {
    allTodos: [String]
    myTodos: [String]
    publicTodos: [String]
  }
`;

const resolvers = {
  Query: {
    allTodos: (_, _, ctx) => {
      if(!ctx.scope)
        throw AuthenticationError('You must authenticate');
      if(ctx.scope !== ADMIN)
        throw ForbiddenError('You must be an administrator');
      return DB.Todos.getAll()
    },
    publicTodos: () => {
      return DB.Todos.getPublic()
    },
    myTodos: (_, _, ctx) => {
      if(ctx.scope)
        throw AuthenticationError('You must authenticate');
      return DB.Todos.getById(context.user_id);
    },
  }
}
```

## Authorizing mutations

TODO

## Should I send a password in a mutation?

TODO

## Authentication Example

If you are new setting up new infrastructure or would like to understand an example of how to adapt your existing login system, you can follow this example using passport.js. We will use this example of authentication in the subsequent sections. To skip this section, jump down to the

```bash
npm install --save express passport body-parser express-session node-uuid passport-local
```

```js
import bodyParser from 'body-parser';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import uuid from 'node-uuid';
```

After installing and importing the necessary packages, this code checks the user's password and attaches their id to the request.

```js
let LocalStrategy = require('passport-local').Strategy;
import { DB } from './schema/db.js';

passport.use(
  'local',
  new LocalStrategy(function(username, password, done) {
    let checkPassword = DB.Users.checkPassword(username, password);
    let getUser = checkPassword
      .then(is_login_valid => {
        if (is_login_valid) return DB.Users.getUserByUsername(username);
        else throw new Error('invalid username or password');
      })
      .then(user => done(null, user))
      .catch(err => done(err));
  }),
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) =>
  DB.Users.get(id).then((user, err) => done(err, user))
);
```

Now that passport has been setup, we initialize the server application to use the passport middleware, attaching the user id to the request.

```js
const app = express();

//passport's session piggy-backs on express-session
app.use(
  session({
    genid: function(req) {
      return uuid.v4();
    },
    secret: 'Z3]GJW!?9uP"/Kpe',
  })
);

//Provide authentication and user information to all routes
app.use(passport.initialize());
app.use(passport.session());
```

Finally we provide the login route and start Apollo Server.

```js
import { typeDefs, resolvers } from './schema';

//login route for passport
app.use('/login', bodyParser.urlencoded({ extended: true }));
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }),
);

new ApolloServer({ typeDefs, resolvers, app }).listen().then(({ url }) => {
  console.log(`Go to ${url} to run queries!`);
});
```
