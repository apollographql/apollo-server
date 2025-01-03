# @apollo/server-integration-testsuite

## 4.11.3

### Patch Changes

- [#8010](https://github.com/apollographql/apollo-server/pull/8010) [`f4228e8`](https://github.com/apollographql/apollo-server/commit/f4228e88509b4cd2f50cf10bc6376d48488e03c1) Thanks [@glasser](https://github.com/glasser)! - Compatibility with Next.js Turbopack. Fixes #8004.

- Updated dependencies [[`f4228e8`](https://github.com/apollographql/apollo-server/commit/f4228e88509b4cd2f50cf10bc6376d48488e03c1), [`70eecce`](https://github.com/apollographql/apollo-server/commit/70eecce69fb9c2b8a812713d1337fdc5c1578ef6)]:
  - @apollo/server@4.11.3

## 4.11.2

### Patch Changes

- [#7879](https://github.com/apollographql/apollo-server/pull/7879) [`b0fb33b`](https://github.com/apollographql/apollo-server/commit/b0fb33b1e22b18923d2e88fb6b30e23de3b664a1) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- [#7968](https://github.com/apollographql/apollo-server/pull/7968) [`68977e2`](https://github.com/apollographql/apollo-server/commit/68977e2b7fdf87197cd5c5cd7035c3b74298150a) Thanks [@glasser](https://github.com/glasser)! - Upgrade supertest and superagent dependencies

- Updated dependencies []:
  - @apollo/server@4.11.2

## 4.11.1

### Patch Changes

- [#7952](https://github.com/apollographql/apollo-server/pull/7952) [`bb81b2c`](https://github.com/apollographql/apollo-server/commit/bb81b2c6b794dcd98fea9d01e4e38c6450287f53) Thanks [@glasser](https://github.com/glasser)! - Upgrade dependencies so that automated scans don't detect a vulnerability.

  `@apollo/server` depends on `express` which depends on `cookie`. Versions of `express` older than v4.21.1 depend on a version of `cookie` vulnerable to CVE-2024-47764. Users of older `express` versions who call `res.cookie()` or `res.clearCookie()` may be vulnerable to this issue.

  However, Apollo Server does not call this function directly, and it does not expose any object to user code that allows TypeScript users to call this function without an unsafe cast.

  The only way that this direct dependency can cause a vulnerability for users of Apollo Server is if you call `startStandaloneServer` with a context function that calls Express-specific methods such as `res.cookie()` or `res.clearCookies()` on the response object, which is a violation of the TypeScript types provided by `startStandaloneServer` (which only promise that the response object is a core Node.js `http.ServerResponse` rather than the Express-specific subclass). So this vulnerability can only affect Apollo Server users who use unsafe JavaScript or unsafe `as` typecasts in TypeScript.

  However, this upgrade will at least prevent vulnerability scanners from alerting you to this dependency, and we encourage all Express users to upgrade their project's own `express` dependency to v4.21.1 or newer.

- Updated dependencies [[`bb81b2c`](https://github.com/apollographql/apollo-server/commit/bb81b2c6b794dcd98fea9d01e4e38c6450287f53)]:
  - @apollo/server@4.11.1

## 4.11.0

### Patch Changes

- Updated dependencies [[`4686454`](https://github.com/apollographql/apollo-server/commit/46864546e131d0079785575f621d69862e635663)]:
  - @apollo/server@4.11.0

## 4.10.5

### Patch Changes

- [#7821](https://github.com/apollographql/apollo-server/pull/7821) [`b2e15e7`](https://github.com/apollographql/apollo-server/commit/b2e15e7db6902769d02de2b06ff920ce74701c51) Thanks [@renovate](https://github.com/apps/renovate)! - Non-major dependency updates

- [#7900](https://github.com/apollographql/apollo-server/pull/7900) [`86d7111`](https://github.com/apollographql/apollo-server/commit/86d711133f3746d094cfb3b39e21fdfa3723181b) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Inline a small dependency that was causing build issues for ESM projects

- Updated dependencies [[`b2e15e7`](https://github.com/apollographql/apollo-server/commit/b2e15e7db6902769d02de2b06ff920ce74701c51), [`86d7111`](https://github.com/apollographql/apollo-server/commit/86d711133f3746d094cfb3b39e21fdfa3723181b)]:
  - @apollo/server@4.10.5

## 4.10.4

### Patch Changes

- Updated dependencies [[`18a3827`](https://github.com/apollographql/apollo-server/commit/18a3827d63c3916f6aaccbc4bdef3e0d550d91a7)]:
  - @apollo/server@4.10.4

## 4.10.3

### Patch Changes

- Updated dependencies [[`5f335a5`](https://github.com/apollographql/apollo-server/commit/5f335a527b6549219366fa44f4bea829e7359aaf)]:
  - @apollo/server@4.10.3

## 4.10.2

### Patch Changes

- Updated dependencies [[`c7e514c`](https://github.com/apollographql/apollo-server/commit/c7e514cf67b05521c66d0561448b3c36b2facee6)]:
  - @apollo/server@4.10.2

## 4.10.1

### Patch Changes

- Updated dependencies [[`72f568e`](https://github.com/apollographql/apollo-server/commit/72f568edd512a865e37e4777bf16a319433ca5ba)]:
  - @apollo/server@4.10.1

## 4.10.0

### Minor Changes

- [#7786](https://github.com/apollographql/apollo-server/pull/7786) [`869ec98`](https://github.com/apollographql/apollo-server/commit/869ec980458df3b22dcc2ed128cedc9d3a85c54b) Thanks [@ganemone](https://github.com/ganemone)! - Restore missing v1 `skipValidation` option as `dangerouslyDisableValidation`. Note that enabling this option exposes your server to potential security and unexpected runtime issues. Apollo will not support issues that arise as a result of using this option.

### Patch Changes

- [#7740](https://github.com/apollographql/apollo-server/pull/7740) [`fe68c1b`](https://github.com/apollographql/apollo-server/commit/fe68c1b05323931d766a5e081061b70e305ac67e) Thanks [@barnisanov](https://github.com/barnisanov)! - Uninstalled `body-parser` and used `express` built-in `body-parser` functionality instead(mainly the json middleware)

- Updated dependencies [[`869ec98`](https://github.com/apollographql/apollo-server/commit/869ec980458df3b22dcc2ed128cedc9d3a85c54b), [`9bd7748`](https://github.com/apollographql/apollo-server/commit/9bd7748565735e3e01cdce38674dbc7dcc44507b), [`63dc50f`](https://github.com/apollographql/apollo-server/commit/63dc50fc65cd7b4a9df0e1de4ab6d6ee82dbeb5c), [`fe68c1b`](https://github.com/apollographql/apollo-server/commit/fe68c1b05323931d766a5e081061b70e305ac67e), [`e9a0d6e`](https://github.com/apollographql/apollo-server/commit/e9a0d6ed035d1a4f509ce39f0558dc17dfb9ccd0)]:
  - @apollo/server@4.10.0

## 4.9.5

### Patch Changes

- [#7717](https://github.com/apollographql/apollo-server/pull/7717) [`681bdd0dc`](https://github.com/apollographql/apollo-server/commit/681bdd0dc103cc855ae1c419b4fb0c526084ce5d) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- Updated dependencies [[`07585fe39`](https://github.com/apollographql/apollo-server/commit/07585fe39751a5d4009664293b6e413078a9b827), [`4fac1628c`](https://github.com/apollographql/apollo-server/commit/4fac1628c5d92bb393ef757f65908129459ab045)]:
  - @apollo/server@4.9.5

## 4.9.4

### Patch Changes

- Updated dependencies [[`ddce036e1`](https://github.com/apollographql/apollo-server/commit/ddce036e1b683adc636a7132e0c249690bf05ce0)]:
  - @apollo/server@4.9.4

## 4.9.3

### Patch Changes

- Updated dependencies [[`a1c725eaf`](https://github.com/apollographql/apollo-server/commit/a1c725eaf53c901e32a15057211bcb3eb6a6109b)]:
  - @apollo/server@4.9.3

## 4.9.2

### Patch Changes

- Updated dependencies [[`62e7d940d`](https://github.com/apollographql/apollo-server/commit/62e7d940de025f21e89c60404bce0dddac84ed6c)]:
  - @apollo/server@4.9.2

## 4.9.1

### Patch Changes

- Updated dependencies [[`ebfde0007`](https://github.com/apollographql/apollo-server/commit/ebfde0007c647d9fb73e3aa24b968def3e307084)]:
  - @apollo/server@4.9.1

## 4.9.0

### Patch Changes

- [#7659](https://github.com/apollographql/apollo-server/pull/7659) [`4784f46fb`](https://github.com/apollographql/apollo-server/commit/4784f46fb580cdcd4359a86180def7d221856480) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- Updated dependencies [[`4ff81ca50`](https://github.com/apollographql/apollo-server/commit/4ff81ca508d46eaafa4aa7c265cf2ba2c4421524), [`4784f46fb`](https://github.com/apollographql/apollo-server/commit/4784f46fb580cdcd4359a86180def7d221856480)]:
  - @apollo/server@4.9.0

## 4.8.1

### Patch Changes

- [#7636](https://github.com/apollographql/apollo-server/pull/7636) [`42fc65cb2`](https://github.com/apollographql/apollo-server/commit/42fc65cb282a8d5b8bf853775a8eedc421d33524) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update test suite for compatibility with Node v20

- Updated dependencies [[`42fc65cb2`](https://github.com/apollographql/apollo-server/commit/42fc65cb282a8d5b8bf853775a8eedc421d33524)]:
  - @apollo/server@4.8.1

## 4.8.0

### Patch Changes

- [#7649](https://github.com/apollographql/apollo-server/pull/7649) [`d33acdfdd`](https://github.com/apollographql/apollo-server/commit/d33acdfddd525c2cb1d5d5810a98e02fb917ac9f) Thanks [@mastrzyz](https://github.com/mastrzyz)! - Add missing `supertest` dependency

- [#7632](https://github.com/apollographql/apollo-server/pull/7632) [`64f8177ab`](https://github.com/apollographql/apollo-server/commit/64f8177abca46865c155ff2fc8ed0194ad8d0c83) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- Updated dependencies [[`f8a8ea08f`](https://github.com/apollographql/apollo-server/commit/f8a8ea08fed4090115b1a025e57bdb0f2deb82fc)]:
  - @apollo/server@4.8.0

## 4.7.5

### Patch Changes

- Updated dependencies [[`4fadf3ddc`](https://github.com/apollographql/apollo-server/commit/4fadf3ddc9611e050dd0f08d51252ed9b0c0d9e1)]:
  - @apollo/cache-control-types@1.0.3
  - @apollo/server@4.7.5
  - @apollo/usage-reporting-protobuf@4.1.1

## 4.7.4

### Patch Changes

- [#7604](https://github.com/apollographql/apollo-server/pull/7604) [`aeb511c7d`](https://github.com/apollographql/apollo-server/commit/aeb511c7d7b3b7260b33c7e392580bac6565e465) Thanks [@renovate](https://github.com/apps/renovate)! - Update `graphql-http` dependency

- [`0adaf80d1`](https://github.com/apollographql/apollo-server/commit/0adaf80d1ee51d8c7e5fd863c04478536d15eb8c) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Address Content Security Policy issues

  The previous implementation of CSP nonces within the landing pages did not take full advantage of the security benefit of using them. Nonces should only be used once per request, whereas Apollo Server was generating one nonce and reusing it for the lifetime of the instance. The reuse of nonces degrades the security benefit of using them but does not pose a security risk on its own. The CSP provides a defense-in-depth measure against a _potential_ XSS, so in the absence of a _known_ XSS vulnerability there is likely no risk to the user.

  The mentioned fix also coincidentally addresses an issue with using crypto functions on startup within Cloudflare Workers. Crypto functions are now called during requests only, which resolves the error that Cloudflare Workers were facing. A recent change introduced a `precomputedNonce` configuration option to mitigate this issue, but it was an incorrect approach given the nature of CSP nonces. This configuration option is now deprecated and should not be used for any reason since it suffers from the previously mentioned issue of reusing nonces.

  Additionally, this change adds other applicable CSPs for the scripts, styles, images, manifest, and iframes that the landing pages load.

  A final consequence of this change is an extension of the `renderLandingPage` plugin hook. This hook can now return an object with an `html` property which returns a `Promise<string>` in addition to a `string` (which was the only option before).

- Updated dependencies [[`0adaf80d1`](https://github.com/apollographql/apollo-server/commit/0adaf80d1ee51d8c7e5fd863c04478536d15eb8c)]:
  - @apollo/server@4.7.4

## 4.7.3

### Patch Changes

- Updated dependencies [[`75b668d9e`](https://github.com/apollographql/apollo-server/commit/75b668d9ed576cbbdeaacdb4adfff051f430c21d)]:
  - @apollo/server@4.7.3

## 4.7.2

### Patch Changes

- Updated dependencies [[`c3f04d050`](https://github.com/apollographql/apollo-server/commit/c3f04d050d24585bc0e285b51e8798b0cc5d1a34)]:
  - @apollo/server@4.7.2

## 4.7.1

### Patch Changes

- Updated dependencies [[`5d3c45be9`](https://github.com/apollographql/apollo-server/commit/5d3c45be9d871ac1ccc2e5cce70fcd60591f39a4)]:
  - @apollo/server@4.7.1

## 4.7.0

### Patch Changes

- [#7509](https://github.com/apollographql/apollo-server/pull/7509) [`5c20aa02e`](https://github.com/apollographql/apollo-server/commit/5c20aa02ebee6eaa39255e9db995fae0dd3fe0a0) Thanks [@renovate](https://github.com/apps/renovate)! - Update `graphql-http` dependency

- [#7475](https://github.com/apollographql/apollo-server/pull/7475) [`b9ac2d6b2`](https://github.com/apollographql/apollo-server/commit/b9ac2d6b2ea19f7f838fa62b339dac2d3fefff62) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- Updated dependencies [[`22a5be934`](https://github.com/apollographql/apollo-server/commit/22a5be9347bbdb6aef4c158f9c81d310308d02d4)]:
  - @apollo/server@4.7.0

## 4.6.0

### Patch Changes

- [#7454](https://github.com/apollographql/apollo-server/pull/7454) [`f6e3ae021`](https://github.com/apollographql/apollo-server/commit/f6e3ae021417c3b54200f8d3fcf4366dc3518998) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Start building packages with TS 5.x, which should have no effect for users

- Updated dependencies [[`1e808146a`](https://github.com/apollographql/apollo-server/commit/1e808146a8043245d9c68969fa73e085d5b1ccbd), [`f6e3ae021`](https://github.com/apollographql/apollo-server/commit/f6e3ae021417c3b54200f8d3fcf4366dc3518998), [`e0db95b96`](https://github.com/apollographql/apollo-server/commit/e0db95b960eb975ebd11f90ead21a589bd3972c8)]:
  - @apollo/server@4.6.0

## 4.5.0

### Patch Changes

- Updated dependencies [[`7cc163ac8`](https://github.com/apollographql/apollo-server/commit/7cc163ac88e801324a24ba7d7e11c38796f52bb4), [`8cbc61406`](https://github.com/apollographql/apollo-server/commit/8cbc61406229653454e50ea98f11dbe834e036b5), [`b694bb1dd`](https://github.com/apollographql/apollo-server/commit/b694bb1dd9880f5acee8917de62cdae4ad647c1f)]:
  - @apollo/server@4.5.0

## 4.4.1

### Patch Changes

- [#7381](https://github.com/apollographql/apollo-server/pull/7381) [`29038a4d3`](https://github.com/apollographql/apollo-server/commit/29038a4d39ef44233b33bc0d036c32d5837f197c) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- Updated dependencies [[`021460e95`](https://github.com/apollographql/apollo-server/commit/021460e95c34ce921dc1c8caa3e5ded3463487ee)]:
  - @apollo/usage-reporting-protobuf@4.1.0
  - @apollo/server@4.4.1

## 4.4.0

### Patch Changes

- Updated dependencies [[`f2d433b4f`](https://github.com/apollographql/apollo-server/commit/f2d433b4f5c92b1a56816c55a8bda2b1e338beeb)]:
  - @apollo/server@4.4.0

## 4.3.3

### Patch Changes

- [#7338](https://github.com/apollographql/apollo-server/pull/7338) [`01bc39838`](https://github.com/apollographql/apollo-server/commit/01bc398388d730c7036a3cfa816e0f129da5d34e) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update graphql-http to 1.13.0

- Updated dependencies [[`9de18b34c`](https://github.com/apollographql/apollo-server/commit/9de18b34cd2ead3da0e0fbbe3eec74a84e20a5d8), [`8c635d104`](https://github.com/apollographql/apollo-server/commit/8c635d104739c9d3fd9c15ac04f5d3a23b1c1917)]:
  - @apollo/server@4.3.3

## 4.3.2

### Patch Changes

- [#7316](https://github.com/apollographql/apollo-server/pull/7316) [`37d884650`](https://github.com/apollographql/apollo-server/commit/37d884650cfde63530f05d97583094e4fc0b51b6) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- Updated dependencies [[`f246ddb71`](https://github.com/apollographql/apollo-server/commit/f246ddb7142d978a927de743108b602c511be119), [`e25cb58ff`](https://github.com/apollographql/apollo-server/commit/e25cb58fffe54301fec562a72f845394c8ff4408)]:
  - @apollo/server@4.3.2

## 4.3.1

### Patch Changes

- [#7285](https://github.com/apollographql/apollo-server/pull/7285) [`35fa72bdd`](https://github.com/apollographql/apollo-server/commit/35fa72bdd694ec3649708b34c89dda3c371389ea) Thanks [@glasser](https://github.com/glasser)! - Adds an integration test verifying that Rover's introspection query works. This should not break any integration that passes other tests.

- [#7276](https://github.com/apollographql/apollo-server/pull/7276) [`15c912f4c`](https://github.com/apollographql/apollo-server/commit/15c912f4cb56bb220168b53b3657da6e680c328d) Thanks [@renovate](https://github.com/apps/renovate)! - Update graphql-http dependency

- Updated dependencies [[`ec28b4b33`](https://github.com/apollographql/apollo-server/commit/ec28b4b33e95ac4df862e67ac70c77895c21bb9c), [`322b5ebbc`](https://github.com/apollographql/apollo-server/commit/322b5ebbc57f854b58577d14d6ec0b5351f5c858), [`3b0ec8529`](https://github.com/apollographql/apollo-server/commit/3b0ec852994f86dd84bdccf77829fb81f8455579)]:
  - @apollo/server@4.3.1

## 4.3.0

### Patch Changes

- [#7228](https://github.com/apollographql/apollo-server/pull/7228) [`f97e55304`](https://github.com/apollographql/apollo-server/commit/f97e55304ceacc5f1586131ad3eb6a99912bc821) Thanks [@dnalborczyk](https://github.com/dnalborczyk)! - Improve compatibility with Cloudflare workers by avoiding the use of the Node `url` package. This change is intended to be a no-op.

- Updated dependencies [[`3a4823e0d`](https://github.com/apollographql/apollo-server/commit/3a4823e0d85afb51b7fb82a9f3a525c1957eab5d), [`d057e2ffc`](https://github.com/apollographql/apollo-server/commit/d057e2ffccac2afc9c3e102db64d74d895157c3d), [`f97e55304`](https://github.com/apollographql/apollo-server/commit/f97e55304ceacc5f1586131ad3eb6a99912bc821), [`d7e9b9759`](https://github.com/apollographql/apollo-server/commit/d7e9b97595b063f1e796ec4449850a16d19e8b18), [`d7e9b9759`](https://github.com/apollographql/apollo-server/commit/d7e9b97595b063f1e796ec4449850a16d19e8b18)]:
  - @apollo/server@4.3.0

## 4.2.2

### Patch Changes

- [#7203](https://github.com/apollographql/apollo-server/pull/7203) [`2042ee761`](https://github.com/apollographql/apollo-server/commit/2042ee7616d150ef357f1964a28ef08415eb6089) Thanks [@glasser](https://github.com/glasser)! - Fix v4.2.0 (#7171) regression where `"operationName": null`, `"variables": null`, and `"extensions": null` in POST bodies were improperly rejected.

- Updated dependencies [[`2042ee761`](https://github.com/apollographql/apollo-server/commit/2042ee7616d150ef357f1964a28ef08415eb6089)]:
  - @apollo/server@4.2.2

## 4.2.1

### Patch Changes

- [#7187](https://github.com/apollographql/apollo-server/pull/7187) [`3fd7b5f26`](https://github.com/apollographql/apollo-server/commit/3fd7b5f26144a02e711037b7058a8471e9648bc8) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update `@apollo/utils.keyvaluecache` dependency to the latest patch which correctly specifies its version of `lru-cache`.

- Updated dependencies [[`3fd7b5f26`](https://github.com/apollographql/apollo-server/commit/3fd7b5f26144a02e711037b7058a8471e9648bc8)]:
  - @apollo/server@4.2.1

## 4.2.0

### Minor Changes

- [#7171](https://github.com/apollographql/apollo-server/pull/7171) [`37b3b7fb5`](https://github.com/apollographql/apollo-server/commit/37b3b7fb57ea105f40776166c9532536fd3f053d) Thanks [@glasser](https://github.com/glasser)! - If a POST body contains a non-string `operationName` or a non-object `variables` or `extensions`, fail with status code 400 instead of ignoring the field.

  In addition to being a reasonable idea, this provides more compliance with the "GraphQL over HTTP" spec.

  This is a backwards incompatible change, but we are still early in the Apollo Server 4 adoption cycle and this is in line with the change already made in Apollo Server 4 to reject requests providing `variables` or `extensions` as strings. If this causes major problems for users who have already upgraded to Apollo Server 4 in production, we can consider reverting or partially reverting this change.

### Patch Changes

- [#7170](https://github.com/apollographql/apollo-server/pull/7170) [`4ce738193`](https://github.com/apollographql/apollo-server/commit/4ce738193f8d073287c34f84c0346276ae2efc30) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update @apollo/utils packages to v2 (dropping node 12 support)

- [#7179](https://github.com/apollographql/apollo-server/pull/7179) [`c8129c23f`](https://github.com/apollographql/apollo-server/commit/c8129c23fd300b8048821544512ccc7df8f12470) Thanks [@renovate](https://github.com/apps/renovate)! - Fix a few tests to support (but not require) TypeScript 4.9.

- [#7171](https://github.com/apollographql/apollo-server/pull/7171) [`37b3b7fb5`](https://github.com/apollographql/apollo-server/commit/37b3b7fb57ea105f40776166c9532536fd3f053d) Thanks [@glasser](https://github.com/glasser)! - The integration test suite now incorporates the `graphql-http` package's audit suite for the "GraphQL over HTTP" specification.

- [#7183](https://github.com/apollographql/apollo-server/pull/7183) [`46af8255c`](https://github.com/apollographql/apollo-server/commit/46af8255c9a23174f0c9a640f0c90666ed80470f) Thanks [@glasser](https://github.com/glasser)! - Apollo Server tries to detect if execution errors are variable coercion errors in order to give them a `code` extension of `BAD_USER_INPUT` rather than `INTERNAL_SERVER_ERROR`. Previously this would unconditionally set the `code`; now, it only sets the `code` if no `code` is already set, so that (for example) custom scalar `parseValue` methods can throw errors with specific `code`s. (Note that a separate graphql-js bug can lead to these extensions being lost; see https://github.com/graphql/graphql-js/pull/3785 for details.)

- Updated dependencies [[`4ce738193`](https://github.com/apollographql/apollo-server/commit/4ce738193f8d073287c34f84c0346276ae2efc30), [`37b3b7fb5`](https://github.com/apollographql/apollo-server/commit/37b3b7fb57ea105f40776166c9532536fd3f053d), [`b1548c1d6`](https://github.com/apollographql/apollo-server/commit/b1548c1d62c6dea656d360bf8f4176e23dd9ee48), [`7ff96f533`](https://github.com/apollographql/apollo-server/commit/7ff96f5331fbf14c0a25094007f6f05e799ee052), [`46af8255c`](https://github.com/apollographql/apollo-server/commit/46af8255c9a23174f0c9a640f0c90666ed80470f)]:
  - @apollo/server@4.2.0

## 4.1.1

### Patch Changes

- Updated dependencies [[`c835637be`](https://github.com/apollographql/apollo-server/commit/c835637be07929e3bebe8f3b262588c6d918e694)]:
  - @apollo/server@4.1.1

## 4.1.0

### Minor Changes

- [`2a2d1e3b4`](https://github.com/apollographql/apollo-server/commit/2a2d1e3b4bbb1f2802b09004444029bd1adb9c19) Thanks [@glasser](https://github.com/glasser)! - The `cache-control` HTTP response header set by the cache control plugin now properly reflects the cache policy of all operations in a batched HTTP request. (If you write the `cache-control` response header via a different mechanism to a format that the plugin would not produce, the plugin no longer writes the header.) For more information, see [advisory GHSA-8r69-3cvp-wxc3](https://github.com/apollographql/apollo-server/security/advisories/GHSA-8r69-3cvp-wxc3).

- [`2a2d1e3b4`](https://github.com/apollographql/apollo-server/commit/2a2d1e3b4bbb1f2802b09004444029bd1adb9c19) Thanks [@glasser](https://github.com/glasser)! - Plugins processing multiple operations in a batched HTTP request now have a shared `requestContext.request.http` object. Changes to HTTP response headers and HTTP status code made by plugins operating on one operation can be immediately seen by plugins operating on other operations in the same HTTP request.

- [`2a2d1e3b4`](https://github.com/apollographql/apollo-server/commit/2a2d1e3b4bbb1f2802b09004444029bd1adb9c19) Thanks [@glasser](https://github.com/glasser)! - New field `GraphQLRequestContext.requestIsBatched` available to plugins.

- [#7114](https://github.com/apollographql/apollo-server/pull/7114) [`c1651bfac`](https://github.com/apollographql/apollo-server/commit/c1651bfacf8d310615be79e9246d7f0bd9bfa926) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Directly depend on Apollo Server rather than as a peer

### Patch Changes

- Updated dependencies [[`2a2d1e3b4`](https://github.com/apollographql/apollo-server/commit/2a2d1e3b4bbb1f2802b09004444029bd1adb9c19), [`2a2d1e3b4`](https://github.com/apollographql/apollo-server/commit/2a2d1e3b4bbb1f2802b09004444029bd1adb9c19), [`2a2d1e3b4`](https://github.com/apollographql/apollo-server/commit/2a2d1e3b4bbb1f2802b09004444029bd1adb9c19)]:
  - @apollo/server@4.1.0

## 4.0.5

### Patch Changes

- Updated dependencies [[`15d8d65e0`](https://github.com/apollographql/apollo-server/commit/15d8d65e018520d3eedc5e42981f19a5f98524e7), [`e4e7738be`](https://github.com/apollographql/apollo-server/commit/e4e7738be7c8d35a42342987e180eba5b6f66ca1), [`e4e7738be`](https://github.com/apollographql/apollo-server/commit/e4e7738be7c8d35a42342987e180eba5b6f66ca1), [`15d8d65e0`](https://github.com/apollographql/apollo-server/commit/15d8d65e018520d3eedc5e42981f19a5f98524e7)]:
  - @apollo/server@4.0.5

## 4.0.4

### Patch Changes

- [#7080](https://github.com/apollographql/apollo-server/pull/7080) [`540f3d97c`](https://github.com/apollographql/apollo-server/commit/540f3d97c30a4892cd4b9a87ba2b26464df74a82) Thanks [@martinnabhan](https://github.com/martinnabhan)! - Recognize malformed JSON error messages from Next.js.

- Updated dependencies []:
  - @apollo/server@4.0.4

## 4.0.3

### Patch Changes

- [#7073](https://github.com/apollographql/apollo-server/pull/7073) [`e7f524eac`](https://github.com/apollographql/apollo-server/commit/e7f524eacad915cbdadeba22827ff039bd8c7390) Thanks [@glasser](https://github.com/glasser)! - Never interpret `GET` requests as batched. In previous versions of Apollo Server 4, a `GET` request whose body was a JSON array with N elements would be interpreted as a batch of the operation specified in the query string repeated N times. Now we just ignore the body for `GET` requests (like in Apollo Server 3), and never treat them as batched.

- [#7071](https://github.com/apollographql/apollo-server/pull/7071) [`0ed389ce8`](https://github.com/apollographql/apollo-server/commit/0ed389ce81bd1783890d86151b174133f0244c92) Thanks [@glasser](https://github.com/glasser)! - Fix v4 regression: gateway implementations should be able to set HTTP response headers and the status code.

- Updated dependencies [[`e7f524eac`](https://github.com/apollographql/apollo-server/commit/e7f524eacad915cbdadeba22827ff039bd8c7390), [`0ed389ce8`](https://github.com/apollographql/apollo-server/commit/0ed389ce81bd1783890d86151b174133f0244c92)]:
  - @apollo/server@4.0.3

## 4.0.2

### Patch Changes

- [#7035](https://github.com/apollographql/apollo-server/pull/7035) [`b3f400063`](https://github.com/apollographql/apollo-server/commit/b3f4000633a9dc5ef983b97e46cba29507ee2955) Thanks [@barryhagan](https://github.com/barryhagan)! - Errors resulting from an attempt to use introspection when it is not enabled now have an additional `validationErrorCode: 'INTROSPECTION_DISABLED'` extension; this value is part of a new enum `ApolloServerValidationErrorCode` exported from `@apollo/server/errors`.

- [#7066](https://github.com/apollographql/apollo-server/pull/7066) [`f11d55a83`](https://github.com/apollographql/apollo-server/commit/f11d55a83cf0300cf31674311e72cb7703c70040) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Add a test to validate error message and code for invalid operation names via GET

- [#7055](https://github.com/apollographql/apollo-server/pull/7055) [`d0d8f4be7`](https://github.com/apollographql/apollo-server/commit/d0d8f4be705065745bd3767a62b8025abe774842) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Fix build configuration issue and align on CJS correctly

- Updated dependencies [[`b3f400063`](https://github.com/apollographql/apollo-server/commit/b3f4000633a9dc5ef983b97e46cba29507ee2955)]:
  - @apollo/server@4.0.2

## 4.0.1

### Patch Changes

- [#7049](https://github.com/apollographql/apollo-server/pull/7049) [`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3) Thanks [@glasser](https://github.com/glasser)! - Raise minimum `engines` requirement from Node.js v14.0.0 to v14.16.0. This is the minimum version of Node 14 supported by the `engines` requirement of `graphql@16.6.0`.

- Updated dependencies [[`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3), [`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3)]:
  - @apollo/server@4.0.1

## 4.0.0

Initial release of `@apollo/server-integration-testsuite`.
