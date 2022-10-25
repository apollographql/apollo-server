---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

Never interpret `GET` requests as batched. In previous versions of Apollo Server 4, a `GET` request whose body was a JSON array with N elements would be interpreted as a batch of the operation specified in the query string repeated N times. Now we just ignore the body for `GET` requests (like in Apollo Server 3), and never treat them as batched.
