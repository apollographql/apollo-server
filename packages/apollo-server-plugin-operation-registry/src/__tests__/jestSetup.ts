// This environment variable is meant to change the behavior of our own tests
// against the operation registry, allowing us to short-circuit live checks
// entirely.

// Since we memoize the environment variables which are used to control the
// override variables for the manifest location it's difficult to temporarily
// override those in Jest mocks without needing to carefully call
// `jest.resetModules` on anything they might have touched. While we could
// special case tests with a check against the common `process.env.NODE_ENV ===
// 'test' variable, this is problematic because customer's tests would also have
// that set. Using this environment variable allows us to make sure we're only
// running in the test suite for this plugin, and not implementors' tests.
process.env['__APOLLO_OPERATION_REGISTRY_TESTS__'] = 'true';
