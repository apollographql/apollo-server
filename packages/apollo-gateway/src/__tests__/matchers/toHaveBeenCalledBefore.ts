// Make this file a module
// See: https://github.com/microsoft/TypeScript/issues/17736
export {};
declare global {
  namespace jest {
    interface Matchers<R, T> {
      toHaveBeenCalledBefore(spy: SpyInstance): R;
    }
  }
}

function toHaveBeenCalledBefore(
  this: jest.MatcherUtils,
  firstSpy: jest.SpyInstance,
  secondSpy: jest.SpyInstance,
): { message(): string; pass: boolean } {
  const firstSpyEarliestCall = Math.min(...firstSpy.mock.invocationCallOrder);
  const secondSpyEarliestCall = Math.min(...secondSpy.mock.invocationCallOrder);

  const pass = firstSpyEarliestCall < secondSpyEarliestCall;

  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toHaveBeenCalledBefore') +
        '\n\n' +
        `Expected ${firstSpy.getMockName()} not to have been called before ${secondSpy.getMockName()}`
    : () =>
        this.utils.matcherHint('.toHaveBeenCalledBefore') +
        '\n\n' +
        `Expected ${firstSpy.getMockName()} to have been called before ${secondSpy.getMockName()}`;

  return {
    message,
    pass,
  };
}

expect.extend({
  toHaveBeenCalledBefore,
});
