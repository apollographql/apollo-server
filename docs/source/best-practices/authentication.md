---
title: Auth
description: Securing our app and serving our users
---

<h2 id="auth-background">Background: Authentication vs. Authorization</h2>

**Authentication** describes a process where an application proves the identity of a user, meaning they user they are attempting to be from the client is the user making the request on the server. In most systems, a user and server share a handshake and token that uniquely pairs them together, ensuring both sides know they are communicating with their intended target.

**Authorization** defines what a user, such as admin or user, is allowed to do. Generally a server will authenticate users and provide them an authorization role that permits the user to perform a subset of all possible operations, such as read and not write.

<h2>Auth in GraphQL</h2>

GraphQL offers similar authentication and authorization mechanics as REST and other data fetching solutions with the possibility to control more fine grain access within a single request. There are two common approaches: schema authorization and operation authorization.

**Schema authorization** follows a similar guidance to REST, where the entire request and response is checked for an authenticated user and authorized to access the servers data.

**Operation authorization** takes advantage of the flexibility of GraphQL to provide public portions of the schema that don't require any authorization and private portions that require authentication and authorization.

> Authorization within our GraphQL resolvers is a great first line of defense for securing our application. We recommened having similar authorization patterns within our data fetching models to ensure a user is authorized at every level of data fetching and updating.

<h2>Authenticating users</h2>

All of the approaches require that users be authenticated with the server. If our system already has login method setup to authenticate users and provide credentials that can be used in subsequent requests, we can use this same system to authenticate GraphQL requests. With that said, if we are creating a new infrastructure for user authentication, we can follow the existing best practice to authenticate users. For a full example of authentication, follow [this example](), which uses [passport.js](http://www.passportjs.org/).

<h2>Schema Authorization</h2>

Schema authorization is useful for GraphQL endpoints that require known users and allow access to all fields inside of a GraphQL endpoint. This approach is useful for internal applications, which are used by a group that is known and generally trusted. Additionally it's common to have separate GraphQL services for different features or products that are entirely available to users, meaning if a user is authenticated, they are authorized to access all the data. Since schema authorization does not need to be aware of the GraphQL layer, our server can add a middleware in front of the GraphQL layer to ensure authorization. 

```js
// authenticate for schema usage
const context = ({ req }) => {
  const user = myAuthenticationLookupCode(req);
  if (!user) {
    throw new Error("You need to be authenticated to access this schema!");
  }
  
  return { user }
};

const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

Currently this server will allow any authenticated user to request all fields in the schema, which means that authorization is all or nothing. While some applications provide a shared view of the data to all users, many use cases require scoping authorizations and limiting what some users can see. The authorization scope is shared across all resolvers, so this code adds the user id and scope to the context.

```js
const { ForbiddenError } = require("apollo-server");

const context = ({ req }) => {
  const user = myAuthenticationLookupCode(req);
  if (!user) {
    throw new ForbiddenError(
      "You need to be authenticated to access this schema!"
    );
  }

  const scope = lookupScopeForUser(user);

  return { user, scope };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

Now within a resolver, we are able to check the user's scope. If the user is not an administrator and `allTodos` are requested, a GraphQL specific forbidden error is thrown. Apollo Server will handle associate the error with the particular path and return it along with any other data successfully requested, such as `myTodos`, to the client.

```js
const { ForbiddenError } = require("apollo-server");

const resolvers = {
  Query: {
    allTodos: (source, args, context) => {
      if (context.scope !== "ADMIN") {
        throw ForbiddenError("Need Administrator Privileges");
      }
      return context.Todos.getAll();
    },
    myTodos: (source, args, context) => {
      return context.Todos.getById(context.user_id);
    }
  }
};
```

The major downside to schema authorization is that all requests must be authenticated, which prevents unauthenticated requests to access information that should be publicly accessible, such as a home page. The next approach, partial query authorization, enables a portion of the schema to be public and authorize portions of the schema to authenticated users.

## Operation Authorization

Operation authorization removes the catch all portion of our context function that throws an unauthenticated error, moving the authorization check within resolvers. The instantiation of the server becomes:

```js
const context = ({ req }) => {
  const user = myAuthenticationLookupCode(req);
  if (!user) {
    return { user: null, scope: null }
  }

  const scope = lookupScopeForUser(user);
  return { user, scope }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
});

server.listen().then(({ url }) => {
  console.log(`🚀 Serverready at ${url}`)
});
```

The benefit of doing operation authorization is that private and public data is more easily managed an enforced. Take for example a schema that allows finding `allTodos` in the app (an administratrative action), seeing any `publicTodos` which requires no authorization, and returning just a single users todos via `myTodos`. Using Apollo Server, we can easiliy build complex authorization models like so:

```js
const { ForbiddenError, AuthenticationError } = require("apollo-server");

const resolvers = {
  Query: {
    allTodos: (source, args, context) => {
      if (!context.scope) {
        throw AuthenticationError("You must be logged in to see all todos");
      }

      if (context.scope !== "ADMIN") {
        throw ForbiddenError("You must be an administrator to see all todos");
      }

      return context.Todos.getAllTodos();
    },
    publicTodos: (source, args, context) => {
      return context.Todos.getPublicTodos();
    },
    myTodos: (source, args, context) => {
      if (!context.scope) {
        throw AuthenticationError("You must be logged in to see all todos");
      }

      return context.Todos.getByUserId(context.user.id);
    }
  }
};
```

## Should I send a password in a mutation?

Since GraphQL queries are sent to a server in the same manner as REST requests, the same policies apply to sending sensitive data over the wire. The current best practice is to provide an encrypted connection over https or wss if we are using websockets. Provided we setup this layer, passwords and other sensitive information should be secure.

## Auth Example

If you are new setting up new infrastructure or would like to understand an example of how to adapt your existing login system, you can follow this example using passport.js. We will use this example of authentication in the subsequent sections. To skip this section, jump down to the

```shell
npm install --save express passport body-parser express-session node-uuid passport-local apollo-server graphql
```

```js
const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const uuid = require('node-uuid');
```

After installing and importing the necessary packages, this code checks the user's password and attaches their id to the request.

```js
let LocalStrategy = require('passport-local').Strategy;
const { DB } = require('./schema/db.js');

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
const { typeDefs, resolvers } = require('./schema');

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

//Depending on the authorization model choosen, you may include some extra middleware here before you instantiate the server

//Create and start your apollo server
const server = new ApolloServer({ typeDefs, resolvers, app });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```
