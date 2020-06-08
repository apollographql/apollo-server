# Change Log

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
