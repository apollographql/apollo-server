---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

Address Content Security Policy issues

The previous implementation of CSP nonces within the landing pages did not take full advantage of the security benefit of using them. Nonces should only be used once per request, whereas Apollo Server was generating one nonce and reusing it for the lifetime of the instance. The reuse of nonces degrades the security benefit of using them but does not pose a security risk on its own. The CSP provides a defense-in-depth measure against a _potential_ XSS, so in the absence of a _known_ XSS vulnerability there is likely no risk to the user.

The mentioned fix also coincidentally addresses an issue with using crypto functions on startup within Cloudflare Workers. Crypto functions are now called during requests only, which resolves the error that Cloudflare Workers were facing. A recent change introduced a `precomputedNonce` configuration option to mitigate this issue, but it was an incorrect approach given the nature of CSP nonces. This configuration option is now deprecated and should not be used for any reason since it suffers from the previously mentioned issue of reusing nonces.

Additionally, this change adds other applicable CSPs for the scripts, styles, images, manifest, and iframes that the landing pages load.

A final consequence of this change is an extension of the `renderLandingPage` plugin hook. This hook can now return an object with an `html` property which returns a `Promise<string>` in addition to a `string` (which was the only option before).
