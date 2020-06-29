# Change Log

### vNEXT

- Drop use of `loglevel-debug`.  This removes the very long date and time prefix in front of each log line and also the support for the `DEBUG=apollo-server:apollo-server-plugin-operation-registry:*` environment variable.  Both of these were uncommonly necessary or seldom used (with the environment variable also being undocumented).  The existing behavior can be preserved by providing a `logger` that uses [`loglevel-debug`](https://npm.im/loglevel-debug), if desired.  [PR #TODO](https://github.com/apollographql/apollo-server/pull/TODO)

### 0.4.1

- __BREAKING__: Use a content delivery network, fetch storage secrets and operation manifests from different domains: https://storage-secrets.api.apollographql.com and https://operations.api.apollographql.com. Please mind any firewall for outgoing traffic.

### 0.4.0:

- This version was accidentally skipped due to a manual update of `package.json`, see `v0.4.1` - @trevor-scheer

### 0.3.1:

- The `schemaTag` option is now deprecated and superseded by `graphVariant`.

### 0.3.0

- Add lifecycle hooks: `onUnregisteredOperation`, and `onForbiddenOperation`.
- Prevent the polling timer from keeping the event loop active
- Update error message for operations that are not in the operation registry.

### 0.2.2

- Update `README` image.

### 0.2.1

- Don't enable logging if `debug` was explicitly set to `false` even if `dryRun` is set to `true`.

### 0.2.0

- Per-tag operation manifests can now be fetched for each tag that has a schema and registered operations.
- Manifest storage path structure updated to `/${graphId}/${storageSecret}/${schemaTag}/manifest.v2.json`. The storage secret is fetched automatically using your API key. No longer uses schema hash.
- Metrics on forbidden and registered operations are now reported to Engine

### 0.1.0

- `apollo-server-plugin-operation-registry`
- Update operation registry plugin to use manifest v2
