import { ApolloServer } from "apollo-server";
import { ApolloGateway, RemoteGraphQLDataSource, GatewayConfig } from "@apollo/gateway";
import DepthLimitingPlugin from "./plugins/ApolloServerPluginDepthLimiting";
import StrictOperationsPlugin from "./plugins/ApolloServerPluginStrictOperations";
import ReportForbiddenOperationsPlugin from "./plugins/ApolloServerPluginReportForbiddenOperation";

const isProd = process.env.NODE_ENV === "production";
const apolloKey = process.env.APOLLO_KEY;
const graphVariant = process.env.APOLLO_GRAPH_VARIANT || "development";

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set("userid", context.userID);
  }
}

let gatewayOptions: GatewayConfig = {
  debug: isProd ? false : true,
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  }
};

if (!apolloKey) {
  console.log(`Head over to https://studio.apollographql.com and create an account to follow walkthrough in the Acephei README`);

  gatewayOptions = {
    serviceList: [
      { name: "accounts", url: "http://localhost:4001" },
      { name: "books", url: "http://localhost:4005" },
      { name: "products", url: "http://localhost:4003" },
      { name: "reviews", url: "http://localhost:4002" }
    ],
    debug: isProd ? false : true,
    buildService({ url }) {
      return new AuthenticatedDataSource({ url });
    }
  }
}

const apolloOperationRegistryPlugin = apolloKey ? require("apollo-server-plugin-operation-registry")({
  graphVariant,
  forbidUnregisteredOperations({
    context, // Destructure the shared request `context`.
    request: {
      http: { headers } // Destructure the `headers` class.
    },
  }) {
    // If a magic header is in place, allow any unregistered operation.
    if (headers.get("override")) return false;
    // Enforce operation safelisting on all other users.
    return isProd;
  }
}) : {};

const gateway = new ApolloGateway(gatewayOptions);
const server = new ApolloServer({
  gateway,
  subscriptions: false, // Must be disabled with the gateway; see above.
  engine: {
    apiKey: apolloKey,   //We set the APOLLO_KEY environment variable
    graphVariant,                           //We set the APOLLO_GRAPH_VARIANT environment variable
    sendVariableValues: {
      all: true
    },
    sendHeaders: {
      all: true
    }
  },
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization || "";

    // parse JWT into scope and user identity
    // const userID = getUserId(token);
    const userID = "1";

    // add the user to the context
    return { userID };
  },
  plugins: [
    DepthLimitingPlugin({ maxDepth: 10 }),
    StrictOperationsPlugin(),
    ReportForbiddenOperationsPlugin({ debug: true }),
    apolloOperationRegistryPlugin
  ]
});

const port = process.env.PORT || 4000;
server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
