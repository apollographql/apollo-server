---
'@apollo/server-integration-testsuite': minor
'@apollo/server': minor
---

If a POST body contains a non-string `operationName` or a non-object `variables` or `extensions`, fail with status code 400 instead of ignoring the field.

In addition to being a reasonable idea, this provides more compliance with the "GraphQL over HTTP" spec.

This is a backwards incompatible change, but we are still early in the Apollo Server 4 adoption cycle and this is in line with the change already made in Apollo Server 4 to reject requests providing `variables` or `extensions` as strings. If this causes major problems for users who have already upgraded to Apollo Server 4 in production, we can consider reverting or partially reverting this change.
