# graphql-server-micro

This is the [Micro](https://github.com/zeit/micro) integration for the Apollo community GraphQL Server. [Read the docs.](http://dev.apollodata.com/tools/apollo-server/index.html)


## Example
```typescript
import { microGraphiql, microGraphql } from "graphql-server-micro";
import micro, { send } from "micro";
import { get, post, router } from "microrouter";
import schema from "./schema";

const graphqlHandler = microGraphql({ schema });
const graphiqlHandler = microGraphiql({ endpointURL: "/graphql" });

const server = micro(
  router(
    get("/graphql", graphqlHandler),
    post("/graphql", graphqlHandler),
    get("/graphiql", graphiqlHandler),
    (req, res) => send(res, 404, "not found"),
  ),
);

server.listen(3000);
```
