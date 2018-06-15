---
title: Data Sources
description: Caching Partial Query Results
---

Data Sources are an extension of data connector that can be extended to create data models. At their core, data sources include functions that can access a type of data source and build in the best practices for caching, deduplication, and batching. By containing the functionality to fetch from a backend, data sources allow server implementation to focus on the core of the project or business, naming the functions that access data and routing where that data comes from. With data sources solving how data is accessed, the server implementation can focus on what and where data is accessed.

Currently the first data source is designed for REST and provides caching for http requests that contain cache control information in the headers. In future releases, this functionality will be expanded to include error handling with automatic retries, enhanced tracing, and batching.

## REST Data Source

A RESTDataSource encapsulates access to a particular REST data source. It contains data source specific configuration and relies on convenience methods to perform HTTP requests with built-in support for caching, batching, error handling, and tracing. First we define a data model that extends the RESTDataSource. This code snippet demonstrates a data model for the star wars api, which supports entity tags, which means that the data source will cache the data automatically.

```js
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

To create a data source, we provide them to the ApolloServer constructor

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    StarWars: new StarWarsAPI(),
  }),
});
```

Then in our resolvers, we can access the data source and return the result. If this request is fetched multiple times during the same request, it will be deduplicated and send a single http request. Provided that the `cache-control` headers are set correctly by the REST api, then the result will be cached across requests for the time specified by the backend.

```js
const typeDefs = gql`
type Query {
  person: Person
}

type Person {
  name: String
}
`

const resolvers = {
  Query: {
    person: (_,_,{ dataSources }) => {
      return dataSources.StarWars.getPerson('1')
    }
  }
}

```

The raw response from the Star Wars REST api appears as follows:

```js
{
    "name": "Luke Skywalker",
}
```
