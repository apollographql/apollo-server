import { Apollo, gql, Schema } from "../index";
import { def } from "../liftoff";

// TODO(AS3) Why can't I apply the `GraphQLSchemaModule` type here?
const testModule = {
  typeDefs: gql`
    type Book {
      title: String
      author: String
    }

    type Query {
      books: [Book]
    }
  `,
  resolvers: {
    Query: {
      books: () => [
        {
          title: "Harry Potter and the Chamber of Secrets",
          author: "J.K. Rowling"
        },
        {
          title: "Jurassic Park",
          author: "Michael Crichton"
        }
      ]
    }
  },
};

describe("ApolloServer", () => {
  it("can execute a query", async () => {
    const server = await Apollo(() => {
      def (Schema) (testModule)
    })

    const operation = await server.executeOperation({
      query: 'query GetBooks { books { author } }',
    })

    expect(operation).toHaveProperty(['data', 'books', 0, 'author']);
    expect(operation).toHaveProperty('errors', undefined);
  });
});
