import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject
} from '@apollo/client';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import { createServer } from 'http';

// in order to keep this service alive on heroku, we start up a server
const server = createServer((req, res) => {
  res.statusCode = 200;
  res.end();
});

server.listen(process.env.PORT || 3000);
const uri = process.env.REMOTE || 'http://localhost:4000';
console.log({ uri });

const clients = [
  new ApolloClient({
    name: 'ios',
    version: '1.2.0',
    link: new HttpLink({ uri, fetch: fetch as any }),
    cache: new InMemoryCache()
  }),
  new ApolloClient({
    name: 'ios',
    version: '1.1.11',
    link: new HttpLink({ uri, fetch: fetch as any }),
    cache: new InMemoryCache()
  }),
  new ApolloClient({
    name: 'ios',
    version: '1.1.10',
    link: new HttpLink({ uri, fetch: fetch as any }),
    cache: new InMemoryCache()
  }),
  new ApolloClient({
    name: 'ios',
    version: '1.1.9',
    link: new HttpLink({ uri, fetch: fetch as any }),
    cache: new InMemoryCache()
  }),
  new ApolloClient({
    name: 'ios',
    version: '1.1.8',
    link: new HttpLink({ uri, fetch: fetch as any }),
    cache: new InMemoryCache()
  })
];

const IDENTITY = gql`
  query ios_MeIdentity {
    me {
      id
      name
      username
    }
  }
`;

const TOP_PRODUCTS = gql`
  query ios_TopProducts {
    topProducts {
      upc
      name
      price
      reviews {
        id
        body
        author {
          id
          username
          name
        }
      }
    }
  }
`;

const MY_REVIEWS = gql`
  query ios_MyReviews {
    me {
      id
      username
      name
      reviews {
        id
        body
        author {
          name
        }
        product {
          upc
          name
          price
        }
      }
    }
  }
`;

const SECONDS = 1000;
function jitter(seconds = 5, jitter = 0.1) {
  const max = seconds * (1 + jitter) * SECONDS;
  const min = seconds * (1 - jitter) * SECONDS;
  return Math.floor(Math.random() * (max - min)) + min;
}

// here we execute traffic of these operations at "random" time intervals until the script is stopped
async function concurrent(
  client: ApolloClient<NormalizedCacheObject>,
  users: number,
  query: DocumentNode
) {
  async function browse() {
    // wait random time within 30 second "session";
    await new Promise(r => setTimeout(r, jitter()));
    // execute "session"
    return await client
      .query({ query, fetchPolicy: 'no-cache' })
      .catch(() => {});
  }

  // once all users finish their session, start it again
  Promise.all(
    Array(users)
      .fill(0)
      .map(browse)
  ).then(() => {
    concurrent(client, users, query);
  });
}

console.log('iOS client sending traffic');
clients.forEach((client, i) => {
  concurrent(client, 50 * (i + 1), TOP_PRODUCTS);
  concurrent(client, 10 * (i + 1), MY_REVIEWS);
  concurrent(client, 1 * (i + 1), IDENTITY);
});
