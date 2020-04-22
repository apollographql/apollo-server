---
title: Why Apollo Server?
---

Building APIs shouldn't have to be so tricky. If you are concerned about performance, security, or just building a service that will make your product easier to build and maintain, you've found the right place! Through practical examples inspired by real world uses, you'll learn how Apollo Server's schema first design and declarative approach to data loading can help you ship faster while writing less code. Lets build the API of your dreams! 🚀

## Schema first design

We think GraphQL's greatest asset is the schema. Think of it like the Rosetta stone of the data your app needs. Schemas represent the touch point of your frontends with the data that powers them. We recommend using the [schema definition language](/schema/schema/#the-schema-definition-language), also called the SDL, to easily write out the data and relationships that your app needs to be successful. Unlike REST APIs, GraphQL schemas shouldn't be a one to one mapping of your database, but rather a representation of how your app works with the data it needs. Let's see what this looks like in practice with Apollo Server:

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Author {
    name: String
    posts: [Post]
  }

  type Post {
    title: String
    author: Author
  }

  type Query {
    posts(authorId: ID!): [Post]
  }
`;

const resolvers = {
  Query: {
    posts: (parent, { authorId }, { Post }) => Post.findByAuthorId(authorId),
  },
};

const server = new ApolloServer({ typesDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Apollo Server is ready at ${url}`)
});
```

In the example above, we are describing the shapes of our data, how they relate to each other, and how to fetch what our client needs from our data source. Apollo Server uses simple functions called [resolvers](/data/resolvers/) to bring to life the schema described in SDL type definitions. When a request comes in to `/graphql`, Apollo Server will translate that request into what it takes to execute the query, will run the resolvers for you to load your data, and return the result in JSON so your app can render it out easily!

Apollo Server takes care of every step of translating the query your client asks for into the data it needs. It is designed to give you maximum control over how you load the data while taking care of everything else for you! You don't need to worry about parsing the request, validating the query, delivering the response, or even profiling your app. Instead, all you have to do is describe the shape of your data and how to find it; Apollo Server does the rest! 💪

Unlike ad-hoc REST endpoints or complex middleware, Apollo Server will make it easy to delete a ton of code needed to build your app. While you may write less code with Apollo Server, you still get the most powerful GraphQL app possible.

## Works with your data

Learning and implementing a new way to manage your data can be scary and risky. Instead of waiting on a brand new project or rewriting your app from scratch, Apollo Server makes is simple to get started immediately. Whether you have a REST API you want to build on top of, existing database to connect to, or third party data sources to wrangle, Apollo works with your data from day one. You can easily start a new server or integrate it with your current app in a couple lines of code without sacrificing any of the amazing benefits it can provide. Apollo Server is the fastest way to bring GraphQL to your products out there.

## Case Studies

Companies ranging from enterprise to startups trust Apollo Server to power their most critical applications. If you'd like to learn more about how transitioning to GraphQL And Apollo improved their engineer's workflows and improved their products, check out these case studies:

[Implementing GraphQL at Major League Soccer](https://labs.mlssoccer.com/implementing-graphql-at-major-league-soccer-ff0a002b20ca)
[The New York Times Now on Apollo](https://open.nytimes.com/the-new-york-times-now-on-apollo-b9a78a5038c).

If your company is using Apollo Server in production, we'd love to feature a case study on the Apollo blog! Please get in touch via Spectrum so we can learn more about how you're using Apollo. Alternatively, if you already have a blog post or a conference talk that you'd like to feature here, please send a [Pull Request](https://github.com/apollographql/apollo-server/pulls).
