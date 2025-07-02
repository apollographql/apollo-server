---
'@apollo/server-plugin-response-cache': patch
'@apollo/server': patch
---

Fix some error logs to properly call `logger.error` or `logger.warn` with `this` set. This fixes errors or crashes from logger implementations that expect `this` to be set properly in their methods.
