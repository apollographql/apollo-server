// It's awkward to read `npm test` output if it is littered with console logs.
// This (from https://github.com/facebook/jest/issues/6121) makes the test fail
// if it writes anything to console. (Feel free to set $ALLOW_CONSOLE if you are
// logging while developing and want to see if your tests pass.)
//
// Typically you can turn off the info/debug in tests by passing a loglevel
// logger with level WARN to the logger option to `new ApolloServer`.
if (!process.env.ALLOW_CONSOLE) {
  let usedConsole = false;
  ['log', 'error', 'warn', 'info', 'debug'].forEach((key) => {
    const originalFn = console[key];
    console[key] = (...args) => {
      usedConsole = true;
      originalFn(...args);
    };
  });

  afterEach(() => {
    if (usedConsole) {
      usedConsole = false;
      throw Error(
        'To keep unit test output readable, tests should not write to the console. To test logging behavior, pass a logger to the class under test.',
      );
    }
  });
}
