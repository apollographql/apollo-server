import { processHttpRequest } from '../transport';
import { gql } from '../../../';
import { buildSchemaFromSDL } from "apollo-graphql";

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

describe("processes an HTTP request", () => {
  const schema = buildSchemaFromSDL([testModule]);

  describe("Status code", () => {
    it("is set to 200 on a single result", async () => {
      const response = processHttpRequest({
        schema,
        request: {
          method: 'POST',
          headers: {},
          parsedRequest: {
            query: "query { books { author } }",
          }
        }
        });

      await expect(response)
        .resolves
        .toHaveProperty('statusCode', 200);
    });
  });

  describe("Headers", () => {
    describe("`Content-type`", () => {
      it("is set to `application/json` on a successful request", async () => {
        const response = processHttpRequest({
          schema,
          request: {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            parsedRequest: {
              query: "query { books { author } }",
            }
          }
          });

        await expect(response)
          .resolves
          .toHaveProperty(['headers', 'content-type'], 'application/json');
      });
    });
  });
});
