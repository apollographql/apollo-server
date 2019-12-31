import { fail } from "./fail";

describe("fail", () => {
  describe("basically", () => {
    const E_EXAMPLE = fail("EXAMPLE");

    it("creates errors", () => {
      expect(E_EXAMPLE().create()).toBeInstanceOf(Error);
    });

    it("has a static code and creates errors with that code", () => {
      expect(E_EXAMPLE.code).toBe('EXAMPLE');
      expect(E_EXAMPLE().create().code).toBe("EXAMPLE");
    });

    it("has the error code as its message", () => {
      expect(E_EXAMPLE().create().message).toMatchInlineSnapshot(`undefined`);
    });

    it("returns a Failure when called, which captures constructor params", () => {
      expect(E_EXAMPLE()).toMatchInlineSnapshot(`
        Failure {
          "messages": Array [],
          "mode": [Function],
          "params": Array [],
        }
      `);
    });
  });

  describe("accepts messages", () => {
    const E_EXAMPLE = fail("EXAMPLE");
    it("as template strings", () => {
      const E_EXAMPLE_TEMPLATE = E_EXAMPLE.message`Something went wrong`;
      expect(E_EXAMPLE_TEMPLATE().create()).toMatchInlineSnapshot(`
        Failure {
          "messages": Array [
            Array [
              Array [
                "Something went wrong",
              ],
            ],
          ],
          "mode": [Function],
          "params": Array [],
        }
      `);
    });

    it("as plain strings", () => {
      const E_EXAMPLE_STRING = E_EXAMPLE.message("A plain string");
      expect(E_EXAMPLE_STRING().create()).toMatchInlineSnapshot(`
        Failure {
          "messages": Array [
            Array [
              "A plain string",
            ],
          ],
          "mode": [Function],
          "params": Array [],
        }
      `);
    });

    it("as formatters, adjusting its required arguments", () => {
      const E_EXAMPLE_FORMAT = E_EXAMPLE.message(
        (p: { cause: string }) => `What went wrong? ${p.cause}`
      );
      expect(E_EXAMPLE_FORMAT({ cause: "something" }).create())
        .toMatchInlineSnapshot(`
        Failure {
          "messages": Array [
            Array [
              [Function],
            ],
          ],
          "mode": [Function],
          "params": Array [
            Object {
              "cause": "something",
            },
          ],
        }
      `);
    });
  });
});
