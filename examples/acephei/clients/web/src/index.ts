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

const client = new ApolloClient({
  name: 'web',
  version: '1.1.0',
  link: new HttpLink({ uri, fetch: fetch as any }),
  cache: new InMemoryCache()
});

const IDENTITY = gql`
  query web_MeIdentity {
    me {
      id
      name
      username
    }
  }
`;

const TOP_PRODUCTS = gql`
  query web_GetTopProducts {
    topProducts {
      upc
      name
      price
      reviews {
        id
        body
        author {
          username
        }
      }
    }
  }
`;

const MY_REVIEWS = gql`
  query web_MyReviews {
    me {
      reviews {
        id
        body
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

console.log('Web client sending traffic');
concurrent(client, 50, TOP_PRODUCTS);
concurrent(client, 10, MY_REVIEWS);
concurrent(client, 1, IDENTITY);
