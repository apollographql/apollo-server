# expressApollo

An Express Middleware for the Apollo Server

## Example Usage

```js
import * as graphql from "graphql";
import * as express from "express";
import * as bodyParser from "body-parser";
import { graphqlHTTP, renderGraphiQL } from "apollo-server";

const port = 3000;
const endpointURL = "/graphql";
const app = express();

const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: "Query",
        fields: {
            testString: { type: graphql.GraphQLString }
        }
    })
});

app.use(bodyParser.json());
app.get("/", renderGraphiQL({endpointURL}));
app.post(endpointURL, graphqlHTTP({schema}));

app.listen(port, () => {
    console.log(`Server is listen on ${port}`);
});
```
