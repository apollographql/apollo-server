import { def, trace } from "./pattern";
import { str, int } from "./ref";

describe("patterns — ", () => {
  it("trace(plan) returns all bonds linked by plan()", () => {
    const name = str`name for testing`();
    const count = int`count for testing`();
    const delta = trace(() => {
      // You can call scalar refs to define them
      name`greeting`("hello world");

      // Or use `def` explicitly (here shown with a key)
      def`with a key`(name)(name);

      // You can omit keys, although doing so means the
      // defs will change every time the plan is evaluated.
      def(count)(10);

      // Calls also work without keys.
      count(1);
    });

    expect(delta).toMatchInlineSnapshot(`
      Array [
        Object {
          "bond": Object {
            "key": DepKey {
              "deps": Array [],
              "site": Array [
                "greeting",
              ],
            },
            "rval": "hello world",
            "state": Object {
              "def": "hello world",
              "ref": [Function],
            },
            "type": "def",
          },
          "mut": "add",
        },
        Object {
          "bond": Object {
            "key": DepKey {
              "deps": Array [],
              "site": Array [
                "with a key",
              ],
            },
            "rval": [Function],
            "state": Object {
              "def": [Function],
              "ref": [Function],
            },
            "type": "def",
          },
          "mut": "add",
        },
        Object {
          "bond": Object {
            "key": DepKey {
              "deps": Array [],
              "site": Array [],
            },
            "rval": 10,
            "state": Object {
              "def": 10,
              "ref": [Function],
            },
            "type": "def",
          },
          "mut": "add",
        },
        Object {
          "bond": Object {
            "key": DepKey {
              "deps": Array [],
              "site": Array [],
            },
            "rval": 1,
            "state": Object {
              "def": 1,
              "ref": [Function],
            },
            "type": "def",
          },
          "mut": "add",
        },
      ]
    `);
  });
});
