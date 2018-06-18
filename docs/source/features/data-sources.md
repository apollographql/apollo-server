---
title: Data Sources
description: Caching Partial Query Results
---

Data sources are components that encapsulate loading data from a particular backend, like a REST API, with built in best practices for caching, deduplication, batching, and error handling. You write the code that is specific to your backend, and Apollo Server takes care of the rest.

## REST Data Source

A `RESTDataSource` is responsible for fetching data from a given REST API. It contains data source specific configuration and relies on convenience methods to perform HTTP requests.

To start, install the release candidate of the REST data source:

```bash
npm install apollo-datasource-rest@rc
```

To define a data source, extend the `RESTDataSource` class. This code snippet shows a data source for the Star Wars API. Note that these requests will be automatically cached based on the caching headers returned from the API.

```js
const { RESTDataSource } = require('apollo-datasource-rest');

export class StarWarsAPI extends RESTDataSource {
  baseURL = 'https://swapi.co/api/';

  async getPerson(id: string) {
    return this.get(`people/${id}`);
  }

  async searchPerson(search: string) {
    return this.get(`people/`, {
      search,
    });
  }
}
```

To create a data source, we provide them to the `ApolloServer` constructor

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    starWars: new StarWarsAPI(),
  }),
});
```

Apollo Server will put the data sources on the context, so you can access them from your resolvers. It will also give data sources access to the context, which is why they need to be configured separately.

Then in our resolvers, we can access the data source and return the result:

```js
const typeDefs = gql`
  type Query {
    person: Person
  }

  type Person {
    name: String
  }
`;

const resolvers = {
  Query: {
    person: (_, id, { dataSources }) => {
      return dataSources.starWars.getPerson(id);
    },
  },
};
```

The raw response from the Star Wars REST API appears as follows:

```js
{
    "name": "Luke Skywalker",
}
```
