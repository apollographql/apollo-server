import { httpHandler, internalServerError } from "../handler";
import { ServerResponse, RequestListener } from "http";
import { PassThrough, Readable } from "stream";
import { ProcessGraphqlRequest } from "../../../execution";

type IMockedResponse = Pick<
      ServerResponse,
      | "setHeader"
      | "writeHead"
      | "statusCode"
      | "statusMessage"
      | "write"
      | "end"
    >

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
const processor: ProcessGraphqlRequest = async () => {
  return {
    data: null,
  }
};

describe("httpHandler", () => {
  describe("construction", () => {
    it("throws when invoked without a processor", () => {
      expect(() => {
        // @ts-ignore
        httpHandler();
      }).toThrow("Invalid handler received: Pass the `executeOperation` " +
      "method from an instance of an `ApolloServer` to this function, or " +
      "a similar function which accepts a `GraphQLRequest` and returns " +
      "a `GraphQLResoonse`.");
    });

    it("returns a RequestListener", () => {
      expect(httpHandler(processor)).toBeInstanceOf(Function);
    });
  });

  describe("RequestListener", () => {
    let handler: RequestListener;
    let res: IMockedResponse;

    beforeEach(() => {
      handler = httpHandler(processor);
      res = mockedResponse();
    });

    it("throws when called with no request", async () => {
      expect.assertions(1);
      try {
        // @ts-ignore Explicitly omitted all arguments (request & response).
        await handler();
      } catch (err) {
        expect(err).toHaveProperty("message",
          "Missing request on HTTP request handler invocation.");
      }
    });

    it("throws when called with no response", async () => {
      try {
        // @ts-ignore Explicitly omitted second argument (response).
        await handler({});
      } catch (err) {
        expect(err).toHaveProperty("message",
          "Missing response sink on HTTP request handler invocation.");
      }
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

describe("internalServerError", () => {
  it("can call the writeHead message with the correct code and message", () => {
    const res = mockedResponse();
    // @ts-ignore The `res` is missing many necessary properties.
    internalServerError(res, "Catastrophic.");
    expect(res.writeHead).toBeCalledTimes(1);
    expect(res.writeHead).toBeCalledWith(500, "Catastrophic.");
    expect(res.end).not.toBeCalled();
  })
});
