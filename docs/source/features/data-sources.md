---
title: Data Sources
description: Caching Partial Query Results
---

Data Sources are an extension of data connector that can be extended to create data models. At their core, data sources include functions that can access a type of data source and build in the best practices for caching, deduplication, and batching. By containing the functionality to fetch from a backend, data sources allow server implementation to focus on the core of the project or business, naming the functions that access data and routing where that data comes from. With data sources solving how data is accessed, the server implementation can focus on what and where data is accessed.

The first data source provides this functionality for REST sources.

## REST Data Source

A RESTDataSource encapsulates access to a particular REST data source. It contains data source specific configuration and relies on convenience methods to perform HTTP requests with built-in support for caching, batching, error handling, and tracing. First we define a data model that extends the RESTDataSource. This code snippet demonstrates a data model for a jokes api.

```js
export class JokesAPI extends RESTDataSource {
  baseURL = 'https://api.icndb.com';

  async getJoke(id: string) {
    return this.get(`jokes/random/${id}`);
  }

  async getJokeByPerson(firstName: string, lastName: string) {
    const body = await this.get('jokes/random', {
      firstName,
      lastName,
    });
    return body.results;
  }
}
```

To create a data source, we provide them to the ApolloServer constructor

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    jokes: new JokesApi(),
  }),
});
```

Then in our resolvers, we can access the data source and return the result. If this request is fetched multiple times during the same request, it will be deduplicated and send a single http request. Provided that the `cache-control` headers are set correctly by the REST api, then the result will be cached across requests for the time specified by the backend.

```js
const typeDefs = gql`
type Query {
  joke: Joke
}

type Joke {
  id: ID
  joke: String
}
`

const resolvers = {
  Query: {
    joke: (_,_,{ dataSources }) => {
      return dataSources.jokes.getJoke.then(({ value }) => value)
    }
  }
}

```

The raw response from the joke REST api appears as follows:

```js
{
  "type": "success",
  "value": {
    "id": 268,
    "joke": "Time waits for no man. Unless that man is Chuck Noris."
  }
}
```
