import { ApolloServer, gql, AuthenticationError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { readFileSync } from "fs";
import { resolve } from "path";

import { UsersDataSource, User } from "./data";

const typeDefs = gql(
  readFileSync(resolve(__dirname, "../schema.graphql"), { encoding: "utf8" })
);

const SECONDS = 1000;
function jitter(seconds: number, jitterAmount: number) {
  const max = seconds * (1 + jitterAmount) * SECONDS;
  const min = seconds * (1 - jitterAmount) * SECONDS;
  return Math.floor(Math.random() * (max - min)) + min;
}

async function randomDelay(seconds = 0.07, jitterAmount = 0.7) {
  await new Promise(r => setTimeout(r, jitter(seconds, jitterAmount)));
}

const resolvers: any = {
  Query: {
    async me(_parent, _args, { dataSources, userID }: Context) {
      if (!userID)
        return new AuthenticationError(
          "You must be logged in to view this data"
        );
      await randomDelay();
      return dataSources.users.find(userID);
    }
  },
  User: {
    async __resolveReference(user: Pick<User, "id">, { dataSources }: Context) {
      await randomDelay();
      return dataSources.users.find(user.id);
    }
  }
};

interface Context {
  userID: string;
  dataSources: {
    users: UsersDataSource;
  };
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  engine: true,
  context: ({ req }) => ({ userID: req.headers.userid }),
  dataSources: () => ({ users: new UsersDataSource() })
});

const port = process.env.PORT || 4001;
server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Accounts service ready at ${url}`);
});
