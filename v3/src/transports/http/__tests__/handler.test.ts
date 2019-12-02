import { gql } from "apollo-server-core";
import { buildSchemaFromSDL } from "apollo-graphql";
import { httpHandler, responseAsInternalServerError } from "../handler";
import { ServerResponse, RequestListener } from "http";
import { PassThrough, Readable } from "stream";
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
          author: "J.K. Rowling",
        },
        {
          title: "Jurassic Park",
          author: "Michael Crichton",
        },
      ],
    },
  },
};

type IMockedResponse = Pick<
      ServerResponse,
      | "setHeader"
      | "writeHead"
      | "statusCode"
      | "statusMessage"
      | "write"
      | "end"
    >

// type IMockedRequest = Pick<IncomingMessage, "method">;
// type IMockedRequestListener = (req: IMockedRequest) => void;

function mockedResponse(): IMockedResponse {
  return {
    writeHead: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn(),
    statusCode: 0,
    statusMessage: "DEFAULT_VALUE",
  };
}

const validQuery= "query { books { author } }";
const schema = buildSchemaFromSDL([testModule]);

describe("httpHandler", () => {
  describe("construction", () => {
    it("returns a RequestListener when invoked with a schema", () => {
      expect(httpHandler(schema)).toBeInstanceOf(Function);
    });

    it("throws when invoked without a schema", () => {
      expect(() => {
        // @ts-ignore
        httpHandler();
      }).toThrowErrorMatchingInlineSnapshot(`"Must pass a schema."`);
    });
  });

  describe("RequestListener", () => {
    let handler: RequestListener;
    let res: IMockedResponse;

    beforeEach(() => {
      handler = httpHandler(schema);
      res = mockedResponse();
    });

    // TODO(AS3) Skipped, but need to enable.
    it.skip("throws when called with no request", () => {
      expect(() => {
        // @ts-ignore
        handler();
      }).toThrowError();
    });

    // TODO(AS3) Move this to testing `jsonBodyParse` and finish it by
    // proving that it's actually failing as it should be.
    // (I'm pretty sure it's failing for the wrong reasons.)
    it.skip("fails with an internal server error on corrupted body streams",
      async () => {
        const pass = new PassThrough();
        const readable = new Readable();
        // readable._read = function () {};

        const req = Object.assign({
          method: 'POST',
          headers: {},
        }, readable);

        pass.write(JSON.stringify({ query: validQuery }));

        // @ts-ignore
        await handler(req, res);

        expect(res.writeHead).toBeCalledWith(500, "Error parsing body");
      }
    );

    // Legacy
    it.todo("returns a 500 if the body of the request is missing");
    it.todo(
      "returns a 400 if the 'query' is missing when the 'GET' method is used",
    );
  });
});

describe("responseAsInternalServerError", () => {
  it("can call the writeHead message with the correct code and message", () => {
    const res = mockedResponse();
    // @ts-ignore
    responseAsInternalServerError(res, "Catastrophic.");
    expect(res.writeHead).toBeCalledTimes(1);
    expect(res.writeHead).toBeCalledWith(500, "Catastrophic.");
    expect(res.end).not.toBeCalled();
  })
});
