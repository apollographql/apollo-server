/**
 * Throw this in places that should be unreachable (because all other cases have
 * been handled, reducing the type of the argument to `never`). TypeScript will
 * complain if in fact there is a valid type for the argument.
 */
export class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(`Unreachable case: ${val}`);
  }
}
