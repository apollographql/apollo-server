import { ProcessGraphqlRequest, GraphQLRequest } from "../../../execution";
import {
  createResponse,
  createRequest,
  RequestOptions,
  ResponseOptions,
} from "node-mocks-http";
import { EventEmitter } from "events";
import {
  __testing__,
  httpHandler,
  AsyncRequestListener,
} from "../handler";
import { URLSearchParams } from "apollo-server-env";
const {
  badRequest,
  internalServerError,
  jsonBodyParse,
  parseGetRequest,
} = __testing__;

const validQuery = "query { books { author } }";
const processor: ProcessGraphqlRequest = async () => {
  return {
    data: null,
  }
};

function buildRequestListenerPair(
  requestOptions: RequestOptions,
  responseOptions: ResponseOptions = Object.create(null),
) {

  if (!requestOptions.method) {
    throw new Error(
      "Internal error: Must pass `method` to " +
      "`buildRequestListenerPair`'s `requestOptions`.");
  }

  return {
    req: createRequest({
      ...requestOptions,
    }),
    res: createResponse({
      eventEmitter: EventEmitter,
      ...responseOptions,
    }),
  }
}

describe("httpHandler", () => {
  describe("construction", () => {
    it("throws when invoked without a processor", () => {
      expect(() => {
        // @ts-ignore Calling this method with missing arguments.
        httpHandler();
      }).toThrow(
        "Invalid handler received: Pass the `executeOperation` method from " +
          "an instance of an `ApolloServer` to this function, or a similar " +
          "function which accepts a `GraphQLRequest` and returns a " +
          "`GraphQLResoonse`."
      );
    });

    it("returns a RequestListener", () => {
      expect(httpHandler(processor)).toBeInstanceOf(Function);
    });
  });

  describe("RequestListener", () => {
    let handler: AsyncRequestListener;
    beforeEach(() => {
      handler = httpHandler(processor);
    });

    describe("guards for programming errors", () => {
      it("throws when called with no request", async () => {
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
    });

    describe("request handling", () => {
      describe("POST", () => {
        let req: ReturnType<typeof createRequest>;
        let res: ReturnType<typeof createResponse>;
        let handlerPromise: Promise<void>;

        beforeEach(() => {
          ({ req, res } = buildRequestListenerPair({ method: 'POST' }));
          handlerPromise = handler(req, res);
        });

        it("returns a 400 when the body is malformed", () => {
          expect.assertions(5);
          // Set expectations to be checked after the response is emitted.
          // Make sure to update the assertion count when adding to this block!
          res.on("end", () => {
            expect(res._getHeaders()).toEqual({});
            expect(res._getStatusCode()).toBe(400);
            expect(res._getStatusMessage()).toBe("Malformed request body");
            expect(res._getData()).toStrictEqual("");
          });

          // Intentional corruption!
          req.send("{");
          return expect(handlerPromise).resolves.toBeUndefined();
        });

        it("returns a 400 when 'variables' is malformed", () => {
          expect.assertions(5);

          // Set expectations to be checked after the response is emitted.
          // Make sure to update the assertion count when adding to this block!
          res.on("end", () => {
            expect(res._getHeaders()).toEqual({});
            expect(res._getStatusCode()).toBe(400);
            expect(res._getStatusMessage()).toBe("Malformed request body");
            expect(res._getData()).toStrictEqual("");
          });

          req.send({
            query: "{ __typename }",
            operationName: "",
            // Intentional variable corruption!
            variables: '{',
            extensions: JSON.stringify({})
          });
          return expect(handlerPromise).resolves.toBeUndefined();
        });

        it("returns a 200 when the body is proper", () => {
          expect.assertions(5);
          // Set expectations to be checked after the response is emitted.
          // Make sure to update the assertion count when adding to this block!
          res.on("end", () => {
            expect(res._getHeaders()).toMatchObject({
              'content-type': 'application/json',
            });
            expect(res._getStatusCode()).toBe(200);
            expect(res._getStatusMessage()).toBe("");
            expect(res._getJSONData()).toStrictEqual({
              data: null,
            });
          });

          req.send({
            query: validQuery,
          });
          return expect(handlerPromise).resolves.toBeUndefined();
        });
      });
    });

    // Legacy
    it.todo("returns a 500 if the body of the request is missing");
    // It seems to me that the `query` very well could be missing in an APQ
    // scenario.  I don't fully understand why we would enable this test.
    it.todo(
      "returns a 400 if the 'query' is missing when the 'GET' method is used",
    );
  });
});

describe("badRequest", () => {
  it("can call the writeHead message with the correct code and message", () => {
    expect.assertions(5);
    const res = createResponse({ eventEmitter: EventEmitter });
    const resEnd = jest.spyOn(res, "end");

    // Set expectations to be checked after the response is emitted.
    // Make sure to update the assertion count when adding to this block!
    res.on("end", () => {
      expect(res._getHeaders()).toEqual({});
      expect(res._getStatusCode()).toBe(400);
      expect(res._getStatusMessage()).toBe("Malformed request.");
      expect(res._getData()).toStrictEqual("");
    });

    // Trigger test criteria
    badRequest(res, "Malformed request.");

    expect(resEnd).toHaveBeenCalledTimes(1);
  });
});

describe("internalServerError", () => {
  it("can call the writeHead message with the correct code and message", () => {
    expect.assertions(5);
    const res = createResponse({ eventEmitter: EventEmitter });
    const resEnd = jest.spyOn(res, "end");

    // Set expectations to be checked after the response is emitted.
    // Make sure to update the assertion count when adding to this block!
    res.on("end", () => {
      expect(res._getHeaders()).toEqual({});
      expect(res._getStatusCode()).toBe(500);
      expect(res._getStatusMessage()).toBe("Catastrophic.");
      expect(res._getData()).toStrictEqual("");
    });

    // Trigger test criteria
    internalServerError(res, "Catastrophic.");

    expect(resEnd).toHaveBeenCalledTimes(1);
  });
});

describe("jsonBodyParse", () => {
  let req: ReturnType<typeof createRequest>;
  let parsedBodyPromise: Promise<GraphQLRequest>;
  beforeEach(() => {
    ({ req } = buildRequestListenerPair({ method: "POST" }));
    parsedBodyPromise = jsonBodyParse(req);
  });

  it("throws a SyntaxError on malformed JSON input", async () => {
    // Intentional corruption!
    req.send("{");
    await expect(parsedBodyPromise).rejects.toThrow(SyntaxError);
    await expect(parsedBodyPromise).rejects
      .toThrowError("Body is malformed JSON");
  });

  it("throws on invalid `variables`", async () => {
    req.send({ variables: "{" });
    await expect(parsedBodyPromise).rejects.toThrow(SyntaxError);
    await expect(parsedBodyPromise).rejects
      .toThrowError("Malformed JSON input for 'variables'");
  });

  it("throws on invalid `extensions`", async () => {
    req.send({ extensions: "{" });
    await expect(parsedBodyPromise).rejects.toThrow(SyntaxError);
    await expect(parsedBodyPromise).rejects
      .toThrowError("Malformed JSON input for 'extensions'");
  });

  it("can parse a body with all GraphQLRequest properties included", () => {
    req.send({
      query: "{ __typename }",
      operationName: "",
      variables: JSON.stringify({}),
      extensions: JSON.stringify({})
    });
    return expect(parsedBodyPromise).resolves.toEqual({
      query: "{ __typename }",
      operationName: "",
      variables: {},
      extensions: {},
    });
  });

  it("can parse a body's 'variables' which include JSON-escaped values", () => {
    req.send({
      query: "{ __typename }",
      operationName: "",
      variables: JSON.stringify({ value: true }),
      extensions: JSON.stringify({})
    });
    return expect(parsedBodyPromise).resolves.toEqual({
      query: "{ __typename }",
      operationName: "",
      variables: {
        value: true,
      },
      extensions: {},
    });
  });

  it("excludes properties not specific to our needs", async () => {
    req.send({
      query: "{ __typename }",
      arbitrary: true
    });
    await expect(parsedBodyPromise).resolves.not.toHaveProperty("arbitrary");
    await expect(parsedBodyPromise).resolves.toHaveProperty("query");
  });

  it("returns GraphQLRequest properties as undefined when absent", async () => {
    req.send({ query: "{ __typename }" });
    await expect(parsedBodyPromise).resolves.toEqual({
      query: "{ __typename }",
      variables: undefined,
      extensions: undefined,
      operationName: undefined
    });
  });
});

describe("parseGetRequest", () => {
  const buildRequestForGet = (
    params?: Record<string, string>,
    requestOptions?: RequestOptions,
  ) => buildRequestListenerPair({
    method: "GET",
    url: "/" +
      // Extra implementation to avoid the query string when params are omitted.
      (
        params ? "?" + (new URLSearchParams(params || {})).toString()
        : ""
      ),
    ...requestOptions,
  });

  describe("query string parses", () => {
    it("a simple `query`", () => {
      const query = '{field}';
      const { req } = buildRequestForGet({ query });
      return expect(parseGetRequest(req)).resolves.toMatchObject({ query });
    });

    it("a more complicated `query`", () => {
      const query = '{ field(argument: "value") { selection }';
      const { req } = buildRequestForGet({ query });
      return expect(parseGetRequest(req)).resolves.toMatchObject({ query });
    });

    it("the `operationName` when specified", () => {
      const query = 'query myQuery {field}';
      const operationName = 'myQuery'
      const { req } = buildRequestForGet({ query, operationName });
      return expect(parseGetRequest(req)).resolves.toMatchObject({
        query,
        operationName,
      });
    });

    it("`operationName` included when `query` unspecified", () => {
      const operationName = 'myQuery'
      const { req } = buildRequestForGet({ operationName });
      return expect(parseGetRequest(req)).resolves.toMatchObject({
        operationName,
      });
    });
  });
});
