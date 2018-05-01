---
title: Performance
description: Reduce requests and speeding up applications
---

GraphQL offers performance benefits for most applications. By reducing round-trips when fetching data, lower the amount of data we are sending back, and make it easier to batch data lookups. Since GraphQL is often built as a stateless request-response pattern, scaling our app horizontally becomes much easier. In this section, we will dive into some benefits that Apollo Server brings to our app, and some patterns for speeding up our service.

## Prevent over-fetching

Rest endpoints often return all of the fields for whatever data they are returning. As applications grow, their data needs grow as well, which leads to a lot of unnecessary data being downloaded by our client applications. With GraphQL this isn't a problem because Apollo Server will only return the data that we ask for when making a request! Take for example a screen which shows an avatar of the currently logged in user. In a rest app we may make a request to `/api/v1/currentUser` which would return a response like this:

```json
{
  "id": 1,
  "firstName": "James",
  "lastName": "Baxley",
  "suffix": "III",
  "avatar": "/photos/profile.jpg",
  "friendIds": [2, 3, 4, 5, 6, 7],
  "homeId": 1,
  "occupation": "farmer",
  // and so on for every field on this model that our client **could** use
}
```

Contrast that to the request a client would send to Apollo Server and the response they would receive:

```graphql
query GetAvatar {
  currentUser { 
    avatar 
  }
}
```

```json
{
  "data": {
    "currentUser": {
      "avatar": "/photos/profile.jpg"
    }
  }
}
```

No matter how much our data grows, this query will always only return the smallest bit of data that the client application actually needs! This will make our app faster and our end users data plan much happier!

## Reducing round-trips

Applications typically need to fetch multiple resources to load any given screen for a user. When building an app on top of a REST API, screens need to fetch the first round of data, then using that information, make another request to load related information. A common example of this would be to load a user, then load their friends:

```js
const userAndFriends = fetch("/api/v1/user/currentUser").then(user => {
  const friendRequest = Promise.all(
    user.friendIds.map(id => fetch(`/api/vi/user/${id}`))
  );

  return friendRequest.then(friends => {
    user.friends = friends;
    return user;
  });
});

```

The above code would make at minimum two requests, one for the logged in user and one for a single friend. With more friends, the number of requests jumps up quite a lot! To get around this, custom endpoints are added into a RESTful API. In this example, a `/api/v1/friends/:userId` may be added to make fetching friends a single request per user instead of one per friend.

With GraphQL this is easily done in a single request! Given a schema like this:

```graphql
type User {
  id: ID!
  name: String!
  friends: [User]
}

type Query {
  currentUser: User
}
```

We can easily fetch the current user and all of their friends in a single request!

```graphql
query LoadUserAndFriends {
  currentUser {
    id
    name
    friends {
      id
      name
    }
  }
}
```

## Batching data lookups

If we take the above query we may think GraphQL simply moves the waterfall of requests from the client to the server. Even if this was true, application speeds would still be improved. However, Apollo Server makes it possible to make applications even faster by batching data requests.

The most common way to batch requests is by using Facebook's [`dataloader`](https://github.com/facebook/dataloader) library. Let's explore a few options for request batching the previous operation:

<h3 id="custom-resolvers">Custom resolvers for batching</h3>

The simplest (and often easiest) way to speed up a GraphQL service is to create resolvers that optimistically fetch the needed data. Often times the best thing to do is to write the simplest resolver possible to look up data, profile it with a tool like Apollo Engine, then improve slow resolvers with logic tuned for the way our schema is used. Take the above query, for example:

```js
const User = {
  friends: (user, args, context) => {
    // A simple approach to find each friend.
    return user.friendIds.map(id => context.UserModel.findById(id));
  }
}

```

The above resolver will make a database lookup for the initial user and then one lookup for every friend that our user has. This would quickly turn into an expensive resolver to call so lets look at how we could speed it up! First, lets take a simple, but proven technique:

```js
const User = {
  friends: (user, args, context) => {
    // a custom model method for looking up multiple users
    return context.UserModel.findByIds(user.friendIds);
  }
}
```

Instead of fetching each user independently, we could fetch all users at once in a single lookup. This would be analogous to `SELECT * FROM users WHERE id IN (1,2,3,4)` vs the previous query would have been multiple versions of `SELECT * FROM users WHERE id = 1`.

Often times, custom resolvers are enough to speed up our server to the levels we want. However, there may be times where we want to be even more efficient when batching data. Lets say we expanded our operation to include more information:

```graphql
query LoadUserAndFriends {
  currentUser {
    id
    name
    friends {
      id
      name
    }
    family {
      id
      name
    }
  }
}
```

Assuming that `family` returns more `User` types, we now are making at minimum three database calls: 1) the user, 2) the batch of friends, and 3) the batch of family members. If we expand the query deeper:

```
query LoadUserAndFriends {
  currentUser {
    id
    name
    friends {
      id
      name
      ...peopleTheyCareAbout
    }
    family {
      id
      name
      ...peopleTheyCareAbout
    }
  }
}

fragment peopleTheyCareAbout on User {
  family {
    id
    name
  }
  friends {
    id
    name
  }
}
```

We are now looking at any number of database calls! The more friends and families that are connected in our app, the more expensive this query gets. Using a library like `dataloader`, we can reduce this operation to a maximum of three database lookups.  Let's take a look at how to implement it to understand what is happening:

```js
const DataLoader = require('dataloader');

// give this to ApolloServer's context
const UserModelLoader = new DataLoader(UserModel.findByIds);

// in the User resolvers
const User = {
  friends: (user, args, context) => {
    return context.UserModelLoader.loadMany(user.friendIds);
  },
  family: (user, args, context) => {
    return context.UserModelLoader.loadMany(user.familyIds);
  }
}
```

After the first data request returns with our current user's information, we execute the resolvers for `friends` and `family` within the same "tick" of the event loop, which is technical talk for "pretty much at the same time". DataLoader will delay making a data request (in this case the `UserModel.findByIds` call) long enough for it to capture the request to look up both friends and families at once! It will combine the two arrays of ids into one so our `SELECT * FROM users WHERE id IN ...` request will contain the ids of both friends **and** families!

The friends and families request will return at the same time so when we select friends and families for all of previously returned users, the same batching can occur across all of the new users requests! So instead of potentially hundreds of data lookups, we can only perform 3 for a query like this!


## Scaling our app

Horizontal scaling is a fantastic way to increase the amount of load that our servers can handle without having to purchase more expensive computing resources to handling it. Apollo Server can scale extremely well like this as long as a couple of concerns are handled:

- Every request should ensure it has access to the required data source. If we are building on top of a HTTP endpoint this isn't a problem, but when using a database it is a good practice to verify our connection on each request. This helps to make our app more fault tolerant and easily scale up a new service which will connect as soon as requests start!
- Any state should be saved into a shared stateful datastore like redis. By sharing state, we can easily add more and more servers into our infrastructure without fear of loosing any kind of state between scale up and scale down.
