---
'@apollo/server': patch
---

Ensure API keys are valid header values on startup

Apollo Server previously performed no sanitization or validation of API keys on startup. In the case that an API key was provided which contained characters that are invalid as header values, Apollo Server could inadvertently log the API key in cleartext.

This only affected users who:
- Provide an API key with characters that are invalid as header values
- Use either schema or usage reporting
- Use the default fetcher provided by Apollo Server or configure their own `node-fetch` fetcher

Apollo Server now trims whitespace from API keys and validates that they are valid header values. If an invalid API key is provided, Apollo Server will throw an error on startup.

For more details, see the security advisory:
https://github.com/apollographql/apollo-server/security/advisories/GHSA-j5g3-5c8r-7qfx
