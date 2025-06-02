---
'@apollo/server-integration-testsuite': patch
---

Provide dual-build CJS and ESM for `@apollo/server-integration-testsuite`.

We previously provided only a CJS build of this package, unlike `@apollo/server`
itself and the other helper packages that come with it. We may make all of
Apollo Server ESM-only in AS5; this is a step in that direction. Specifically,
only providing this package for CJS makes it challenging to run the tests in
`ts-jest` in some ESM-only setups, because the copy of `@apollo/server` fetched
directly in your ESM-based test may differ from the copy fetched indirectly via
`@apollo/server-integration-testsuite`, causing the "lockstep versioning" test
to fail.
