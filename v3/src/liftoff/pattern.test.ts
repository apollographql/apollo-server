import { def, trace } from "./pattern";
import { str, int } from "./ref";

describe("patterns — ", () => {
  it("trace(plan) returns all bonds linked by plan()", () => {
    const name = str`name for testing`;
    const count = int`count for testing`;
    const pattern = trace(() => {
      def(name, "hello world");
      def(count, 1);
      def(count, 10);
    });

    expect(pattern).toMatchInlineSnapshot(`
      Array [
        Object {
          "def": "hello world",
          "ref": [Function],
          "type": "def",
        },
        Object {
          "def": 1,
          "ref": [Function],
          "type": "def",
        },
        Object {
          "def": 10,
          "ref": [Function],
          "type": "def",
        },
      ]
    `);
  });
});
