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
// This `URLSchemaParams` could very well be a polyfill, like the one we once
// offered in `apollo-serve-env`, but we should reconsider exactly what we want
// that package to offer and how/where we want it to exist before consciously
// choosing to use it again.
import { URLSearchParams } from "url";
const {
  badRequest,
  internalServerError,
  jsonBodyParse,
  parseGetRequest,
} = __testing__;

// This is meant to be a "valid query" in the sense that it represents what
// might be a valid query, though it's worth noting that there is no validation,
// no schema, and no implementation to make it real.  It's used in test-cases
// below for representative purposes, and nothing else.
const validQuery = "query { books { author } }";

/**
 * This is a mock processor which is meant to mimic what must be a more complete
 * GraphQL processor.  It is, however, _not_ a complete implementation because
 * this test-suite aims to test only the handler properties and not details
 * which are tested more thoroughly elsewhere (e.g. transport, execution).
 */
const mockProcessor: ProcessGraphqlRequest = async ({ request }) => {
  // We have very loose requirements in this mock processor.  In fact, nothing
  // actually exercises this error right now, but it remains here to prevent
  // inadvertant mis-use of this methid in a future test.
  if (!request.query && !request.extensions) {
    throw new Error("Unable to process with mockProcessor.");
  }

  // Note that this is always "successful", since we're not testing the
  // error properties at the handler level, but rather the transport.
  return {
    data: null,
  }
};

/**
 * Mock type of Node.js' `http.IncomingMessage`.
 */
type MockRequest = ReturnType<typeof createRequest>;

/**
 * Mock type of Node.js' `http.ServerResponse`.
 */
type MockResponse = ReturnType<typeof createResponse>;

/**
 * HTTP parameters to be passed as part of a request.  For POST requests, these
 * will be serialized into JSON and send in the body of the request.  For GET
 * requests, they will become part of the query-string.
 */
type Params = Record<string, string> | string | undefined;

interface TestableRequestListener {
  /**
   * Access to the `req` (i.e. `http.IncomingMessage`)
   */
  req: MockRequest;

  /**
   * Access to the `res` (i.e. `http.ServerResponse`)
   */
  res: MockResponse;

  /**
   * Used by tests to send the appropriately shaped request to the mocked
   * request (i.e. `MockRequest`, a.k.a. `http.IncomingMessage`) depending on
   * whether the `method` in use is `GET` or `POST`.  Because of the placement
   * of those variables and the way that transmitting these parameters varies
   * depending on the method (`GET` in the query string and `POST` in the body)
   * this method is responsible for creating the actual test handler.  This is
   * because the parameters for a `GET` request should be present at the time
   * the request object is instantiated contrasted with `POST`-ed parameters
   * which are sent as a stream of data after the request is already going.
   *
   * This abstraction allows us to write single tests and have them exercised
   * for both `GET` and `POST` and to ensure that they behave identically.
   */
  initHandlerWithParams: (params: Params) => void;

  /**
   * A `Promise` that will eventually resolve or reject to the handler.
   *
   * This will not yield an actual handler until data has been transmitted
   * to be used by the handler with `initHandlerWithParams` for the reasons
   * noted in that method's description.
   *
   * In practice, since the handler doesn't actually return anything, this will
   * either result in a resolution to `undefined`, or a `rejection` with an
   * error.
   */
  handlerPromise: ReturnType<AsyncRequestListener>;
}

function createMockRequestListener(
  requestOptions: RequestOptions,
  responseOptions: ResponseOptions = Object.create(null),
) {
  const req = createRequest({
    ...requestOptions,
  });

  const res = createResponse({
    eventEmitter: EventEmitter,
    ...responseOptions,
  });

  return {
    req,
    res,
  }
}

/**
 * Create a testable `RequestListener` to test both POST and GET requests
 *
 * POST requests receive their parameters as a steram of data on the body
 * while GET requests are provided their parameters in the query string.  We
 * aim to support both of these methods though the behavior between them should
 * be mostly the same.  While POST requests might eventually be
 * used for more complicated purposes (e.g. uploads), the core functionality
 * (e.g. parsing of `variables`, `extensions`) should remain the same and be
 * tested in an identical fashion.  The actual parsing of the parameters is
 * still tested separately, within the `parseGetRequest` and `parsePostRequest`
 * methods laster in this test-suite.
 *
 * @param params Parameters defined by `TestableRequestListenerParams`
 */
function getTestableRequestListener(
  {
    requestOptions,
    responseOptions,
    handler,
  }: {
    requestOptions: RequestOptions;
    responseOptions?: ResponseOptions;
    handler: AsyncRequestListener;
  }): TestableRequestListener {

  if (!requestOptions.method) {
    throw new Error(
      "Internal error: Must pass `method` to " +
      "`buildRequestListenerPair`'s `requestOptions`.");
  }

  // Create a `Promise` which will eventually resolve to the return result of
  // the aynchronous handler.  In order to send the data only after the handler
  // was created, the handler won't actually be created until after we have
  // data to be sent to it.
  let handlerPromiseResolve: (value?: Promise<void>) => void;
  const handlerPromise =
    new Promise<ReturnType<AsyncRequestListener>>((resolve) => {
      handlerPromiseResolve = resolve;
    })
    // We'll actually return the `Promise` of the handler itself here to
    // un-wrap what would otherwise be a `Promise` of a `Promise`.
    .then((resolved) => resolved);

  let initPromiseResolve: (value?: void) => void;
  const initPromise = new Promise<void>((resolve) => {
    initPromiseResolve = resolve;
  }).then(() =>  handlerPromiseResolve(handler(req, res)));

  const { req, res } = createMockRequestListener(requestOptions, responseOptions)

  const initHandlerWithParams: TestableRequestListener['initHandlerWithParams'] =
    async (params) => {
      // For a GET request, we'll apply the parameters as the query string.
      if (req.method === "GET") {
        req.url = "/" +
          // Extra implementation to avoid the query string when params omitted.
          (params ? "?" + (new URLSearchParams(params || {})).toString() : "");
      }

      // For a POST request, we'll stream the data in the body after we create
      // the handler.
      initPromise.then(() => {
        if (req.method === "POST") {
          req.send(params);
        }
      });

      initPromiseResolve();
    }

  return {
    req,
    res,
    initHandlerWithParams,
    handlerPromise,
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
          "`GraphQLResponse`."
      );
    });

    it("returns a RequestListener", () => {
      expect(httpHandler(mockProcessor)).toBeInstanceOf(Function);
    });
  });

  describe("RequestListener", () => {
    let handler: AsyncRequestListener;
    beforeEach(() => {
      handler = httpHandler(mockProcessor);
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

    describe.each<RequestOptions["method"]>([
      "GET",
      "POST",
    ])(
      "request handling - %s",
      (method) => {
        let req: TestableRequestListener['req'],
            res: TestableRequestListener['res'],
            handlerPromise: TestableRequestListener['handlerPromise'],
            initHandlerWithParams: TestableRequestListener['initHandlerWithParams'];

        beforeEach(async () => {
          (
            // Destructure into the locally scoped variables to allow
            // abbreviated usage within all of the tests below.
            { req, res, initHandlerWithParams, handlerPromise } =
            getTestableRequestListener({
              requestOptions: { method },
              handler,
            })
          );
        });

        // This also tests the behavior of the `initHandlerWithParams` helper.
        it("reads streams of the request body appropriately", async () => {
          // Only one of the two scenarios should be triggered.
          expect.assertions(1);
          const reqOn = jest.spyOn(req, "on");
          await initHandlerWithParams({ query: validQuery });
          if (method === "POST") {
            // In theory, it would have been called multiple times, but this
            // test doesn't check for those details.
            expect(reqOn).toHaveBeenCalled();
          } else if (method === "GET") {
            expect(reqOn).not.toHaveBeenCalled();
          }
        });

        it("returns a 400 when 'variables' is malformed", async () => {
          expect.assertions(5);

          // Set expectations to be checked after the response is emitted.
          // Make sure to update the assertion count when adding to this block!
          res.on("end", () => {
            expect(res._getHeaders()).toEqual({});
            expect(res._getStatusCode()).toBe(400);
            expect(res._getStatusMessage()).toBe("Malformed request body");
            expect(res._getData()).toStrictEqual("");
          });

          await initHandlerWithParams({
            query: "{ __typename }",
            operationName: "",
            // Intentional variable corruption!
            variables: '{',
            extensions: JSON.stringify({})
          });
          await expect(handlerPromise).resolves.toBeUndefined();
        });

        it("returns a 400 when 'extensions' is malformed", async () => {
          expect.assertions(5);

          // Set expectations to be checked after the response is emitted.
          // Make sure to update the assertion count when adding to this block!
          res.on("end", () => {
            expect(res._getHeaders()).toEqual({});
            expect(res._getStatusCode()).toBe(400);
            expect(res._getStatusMessage()).toBe("Malformed request body");
            expect(res._getData()).toStrictEqual("");
          });

          await initHandlerWithParams({
            query: "{ __typename }",
            operationName: "",
            variables: JSON.stringify({}),
            // Intentional variable corruption!
            extensions: '{',
          });
          await expect(handlerPromise).resolves.toBeUndefined();
        });

        it("returns a 200 when the body is proper", async () => {
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

          await initHandlerWithParams({
            query: validQuery,
          });
          await expect(handlerPromise).resolves.toBeUndefined();
        });
      }
    );

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
  let req: MockRequest;
  let parsedBodyPromise: Promise<GraphQLRequest>;
  beforeEach(() => {
    ({ req } = createMockRequestListener({ method: "POST" }));
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
  ) => createMockRequestListener({
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
