import { ApolloServer, gql } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { readFileSync } from "fs";
import { resolve } from "path";

import {
  ReviewsDataSource,
  UsersDataSource,
  User,
  Review,
  Product
} from "./data";

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
  Review: {
    async __resolveReference(review: Review, { dataSources: { reviews } }: Context) {
      await randomDelay();
      return reviews.find(review.id);
    },
    async author(review: Review) {
      await randomDelay();
      return { __typename: "User", id: review.authorID };
    }
  },
  User: {
    async reviews(user: User, _args: {}, { dataSources: { reviews } }: Context) {
      await randomDelay();
      return reviews.findByAuthor(user.id);
    },
    async username(user: User, _args: {}, { dataSources: { users } }: Context) {
      const found = await users.find(user.id);
      return found ? found.username : null;
    }
  },
  Furniture: {
    async reviews(
      product: Product,
      _args: {},
      { dataSources: { reviews } }: Context
    ) {
      await randomDelay();
      return reviews.findByProduct(product.upc!);
    },
    async reviewList(product: Product, args: { first: number, after: number, type: string }, { dataSources: { reviews } }: Context) {
      await randomDelay();
      // TODO implement proper pagination
      const items = await reviews.findByProduct(product.upc!);

      return {
        pageInfo: {},
        edges: items.map(review => ({ review }))
      }
    }
  },
  Book: {
    async reviews(
      book: Product,
      _args: {},
      { dataSources: { reviews } }: Context
    ) {
      await randomDelay();
      return reviews.findByProduct(book.isbn!);
    },
    async reviewList(product: Product, args: { first: number, after: number, type: string }, { dataSources: { reviews } }: Context) {
      await randomDelay();
      // TODO implement proper pagination
      const items = await reviews.findByProduct(product.isbn!);

      return {
        pageInfo: {},
        edges: items.map(review => ({ review }))
      }
    },
    async relatedReviews(
      book: Product,
      _args: {},
      { dataSources: { reviews } }: Context
    ) {
      await randomDelay();
      return book.similarBooks
        ? book.similarBooks
            .map(({ isbn }: any) =>
              reviews.findByProduct(isbn),
            )
            .flat()
        : [];
    },
  },
};

interface Context {
  dataSources: {
    reviews: ReviewsDataSource;
    users: UsersDataSource;
  };
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  engine: true,
  dataSources: () => ({
    reviews: new ReviewsDataSource(),
    users: new UsersDataSource()
  })
});

const port = process.env.PORT || 4002;
server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Reviews service ready at ${url}`);
});
