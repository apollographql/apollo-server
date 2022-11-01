# Apollo Server Integration Testsuite

This package serves as a set of Jest tests for Apollo Server integration
authors. Any Node package which functions as the HTTP (or HTTP framework)
binding and Apollo Server can run these tests to ensure parity with the 1st
party Express integration.

> Note: this package is only intended for integration _authors_. If your project
> _runs_ an Apollo Server instance, you probably shouldn't use this.

The version of this package will be published in lockstep with Apollo Server, so
choose the same version of this package as the version of Apollo Server which
you intend to support. The expected configuration for an integration should
follow the pattern:

```json
{
  "name": "my-server-integration",
  "devDependencies": {
    "@apollo/server": "4.1.0",
    "@apollo/server-integration-testsuite": "4.1.0"
  },
  "peerDependencies": {
    "@apollo/server": "^4.0.0"
  }
}
```

In the example above, the `peerDependencies` allow your configuration to be used
with the full range of Apollo Server v4 packages. The `devDependencies` which
your integration is built and tested against should stay up-to-date with the
latest version of Apollo Server, and the server and testsuite packages should be
in lockstep with each other.

This package imposes dependency requirements on your project, however it should
only require they be installed as `devDependencies`:
* `@apollo/server`'s version must match the version of the test suite.
* The test suite expects you to be running `jest@28`. It's possible that other
  versions of Jest may be compatible, but this use case is unsupported and might
  lead to unexpected behavior. It's fine for your project to use a testing
  framework other than Jest, but you'll still need to configure Jest in your
  project in order to run the test suite (so you'll have two test runners
  configured in your project). Because of this, we recommend using only Jest in
  your project for simplicity.
* `graphql` must be installed in your project in `peerDependencies` and your
  version range should match that of `@apollo/server`. The test suite package's
  `graphql` dependency will match that of Apollo Server's.
