import { ApolloServer, gql, AuthenticationError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { readFileSync } from "fs";
import { resolve } from "path";

import { BooksDataSource, Book } from "./data";

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
  Book: {
    async __resolveReference(book: Pick<Book, "isbn">, { dataSources }: Context) {
      await randomDelay();
      return dataSources.books.find(book.isbn);
    },
    async similarBooks(book: Book, _args,  { dataSources }: Context) {
      await randomDelay();
      return book.similarBooks
        ? book.similarBooks
            .map((isbn: string) => dataSources.books.find(isbn))
            .filter(Boolean)
        : [];
    },
  }
};

interface Context {
  dataSources: {
    books: BooksDataSource;
  };
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  engine: true,
  dataSources: () => ({ books: new BooksDataSource() })
});

const port = process.env.PORT || 4005;
server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Books service ready at ${url}`);
});
