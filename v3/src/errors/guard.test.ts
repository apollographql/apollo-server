import { guard, Comparison } from "./guard";
import { fail } from "./fail";

describe("guard", () => {
  it("asserts conditions", () => {
    const a = "hello";
    expect(() => {
      guard(a !== a);
    }).toThrowErrorMatchingInlineSnapshot(`"Assertion failed"`);
  });

  it("passes when condition ok", () => {
    const a = "hello";
    expect(() => {
      guard(a === a);
    }).not.toThrow();
  });

  it(".instance asserts instanceof", () => {
    expect(() => {
      guard.instance(2, String);
    }).toThrowErrorMatchingInlineSnapshot(
      `"Assertion failed: 2 instanceof String"`
    );
  });

  it(".instance passes when ok", () => {
    expect(() => {
      guard.instance(new String("hello"), String);
    }).not.toThrow();
  });

  const comparisons: Comparison[] = ['<', '>', '==', '===', '!=', '!==', '<=', '>=']
  const obj = {}

  it.each([...function*() {
    const obj = {}
    const examples = new Map<any, any>()
    examples.set(0, [-1, 1, 0, 100, -Infinity, Infinity])
    examples.set('hello', ['hello', '', obj])
    examples.set(obj, [{}, obj, 'a string'])
    for (const lhs of examples.keys()) {
      for (const rhs of examples.get(lhs)) {
        for (const op of comparisons) {
          yield [lhs, op, rhs]
        }
      }
    }
  }()])("compares %s %s %s", ((lhs, op, rhs) => {
    const func = `((l, r) => l ${op} r)`
    const run = expect(() => {
      guard(lhs, op, rhs)
    })
    if (eval(func)(lhs, rhs)) {
      run.not.toThrow()
    } else {
      run.toThrowError(`Assertion failed: ${lhs} ${op} ${rhs}`)
    }
  }));

  it('compares objects', () => {
    guard(obj, '==', obj)
  })

  const E_TOO_FAST = fail("TOO_FAST").msg(
    (props: { maxRate: number, rate: number, client: string }) =>
      `Client ${props.client} exceeded ${props.maxRate} with rate=${props.rate}`
  );
  it("optionally, takes a failure to guard with", () => {
    const maxRate = 1000;
    const rate = 9999;
    const client = "a-client";
    expect(() => {
      guard(rate, "<=", maxRate, E_TOO_FAST({ maxRate, rate, client }));
    }).toThrowErrorMatchingInlineSnapshot(`
"Client a-client exceeded 1000 with rate=9999

Assertion failed: 9999 <= 1000"
`);
  });
});
