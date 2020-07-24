import { ApolloServer, gql } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { readFileSync } from "fs";
import { resolve } from "path";

import { ProductsDataSource, Product } from "./data";

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
  Furniture: {
    async __resolveReference(
      product: Product,
      { dataSources: { products } }: Context
    ) {
      await randomDelay();
      return products.find(product.upc || product.sku);
    }
  },
  Book: {
    async __resolveReference(book: Product, { dataSources: { products } }: Context) {
      await randomDelay();
      if (book.isbn) {
        const fetchedObject = await products.find(book.isbn);
        if (fetchedObject) {
          return { ...book, ...fetchedObject };
        }
      }
      return book;
    },
    name(book: Product, { delimeter }) {
      return `${book.title}${delimeter}(${book.year})`;
    },
    upc(book: Product) {
      return book.isbn;
    },
    sku(book: Product) {
      return book.isbn;
    }
  },
  Query: {
    async topProducts(
      _: any,
      args: { first: number },
      { dataSources: { products } }: Context
    ) {
      await randomDelay();
      return products.findMany({ first: args.first });
    },
    async products(_: any, args: { first: number, after: number, type: string }, { dataSources: { products } }: Context) {
      await randomDelay();
      // TODO implement proper pagination
      const items = await products.findMany({ first: args.first });

      return {
        pageInfo: {},
        edges: items.map(product => ({ product }))
      }
    }
  }
};

interface Context {
  dataSources: {
    products: ProductsDataSource;
  };
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  engine: true,
  dataSources: () => ({
    products: new ProductsDataSource()
  })
});

const port = process.env.PORT || 4003;
server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Products service ready at ${url}`);
});
