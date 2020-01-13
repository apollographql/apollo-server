import { ProcessGraphqlRequest } from "../../../execution";
import { createResponse, createRequest } from "node-mocks-http";
import { EventEmitter } from "events";
import {
  __testing__,
  httpHandler,
  AsyncRequestListener,
} from "../handler";
const {
  badRequest,
  internalServerError,
} = __testing__;

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
    let handler: AsyncRequestListener;
    beforeEach(() => {
      handler = httpHandler(processor);
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

    it("returns a 400 when the body is malformed", () => {
      expect.assertions(5);
      const req = createRequest({ method: "POST" });
      const res = createResponse({ eventEmitter: EventEmitter });

      // Set expectations to be checked after the response is emitted.
      // Make sure to update the assertion count when adding to this block!
      res.on("end", () => {
        expect(res._getHeaders()).toEqual({});
        expect(res._getStatusCode()).toBe(400);
        expect(res._getStatusMessage()).toBe("Error parsing body");
        expect(res._getData()).toStrictEqual("");
      });

      const handlerPromise = handler(req, res);

      // Intentional corruption!
      req.send("{");
      return expect(handlerPromise).resolves.toBeUndefined();
    });

    // Legacy
    it.todo("returns a 500 if the body of the request is missing");
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
