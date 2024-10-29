---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

Upgrade dependencies so that automated scans don't detect a vulnerability.

`@apollo/server` depends on `express` which depends on `cookie`. Versions of `express` older than v4.21.1 depend on a version of `cookie` vulnerable to CVE-2024-47764. Users of older `express` versions who call `res.cookie()` or `res.clearCookie()` may be vulnerable to this issue.

However, Apollo Server does not call this function directly, and it does not expose any object to user code that allows TypeScript users to call this function without an unsafe cast.

The only way that this direct dependency can cause a vulnerability for users of Apollo Server is if you call `startStandaloneServer` with a context function that calls Express-specific methods such as `res.cookie()` or `res.clearCookies()` on the response object, which is a violation of the TypeScript types provided by `startStandaloneServer` (which only promise that the response object is a core Node.js `http.ServerResponse` rather than the Express-specific subclass). So this vulnerability can only affect Apollo Server users who use unsafe JavaScript or unsafe `as` typecasts in TypeScript.

However, this upgrade will at least prevent vulnerability scanners from alerting you to this dependency, and we encourage all Express users to upgrade their project's own `express` dependency to v4.21.1 or newer.
