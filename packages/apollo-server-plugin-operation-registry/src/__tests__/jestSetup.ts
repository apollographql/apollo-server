// Since we memoize the environment variables which are used to control the
// override variables for the manifest location (in an effort to avoid the
// costly checking of `process.env` on each check; a notable production
// performance win), it's difficult to temporarily override those in Jest mocks
// without needing to carefully call `jest.resetModules` on anything they might
// have touched.We set this in order to allow a more simplified approach to
// testing.  While we could have (and previously did) leverage a check against
// the `process.env.NODE_ENV === 'test' variable, this is problematic because
// customer's tests would also have that set.  Using this environment variable
// allows us to make sure we're only running in the test suite for this plugin,
// and not implementors' tests.
process.env['__APOLLO_OPERATION_REGISTRY_TESTS__'] = 'true';
