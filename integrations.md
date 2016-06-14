# expressApollo

An Express Middleware for the Apollo Server

## Example Usage

```js
import * as express from "express";
import * as bodyParser from "body-parser";
import { expressApollo } from "apollo-server";
import schema from "./data/schema";
import * as graphql from 'graphql'

const port = 3000;
const app = express();
const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'Query',
        fields: {
            testString: { type: graphql.GraphQLString }
        }
    })
});

app.use(bodyParser.text());
app.use("/", expressApollo({schema}));

app.listen(port, () => {
    console.log(`Server is listen on ${port}`);
});
```
