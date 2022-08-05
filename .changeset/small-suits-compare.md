---
"@apollo/server-integration-testsuite": patch
"@apollo/server": patch
---

Refactor error formatting.

Remove `error.extensions.exception`; you can add it back yourself with `formatError`. `error.extensions.exception.stacktrace` is now available on `error.extensions.stacktrace`.

Provide `unwrapResolverError` function in `@apollo/server/errors`; useful for your `formatError` hook.

No more TS `declare module` describing the `exception` extension (partially incorrectly).

Rename the (new in v4) constructor option `includeStackTracesInErrorResponses` to `includeStacktraceInErrorResponses`.
