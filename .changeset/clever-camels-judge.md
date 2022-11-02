---
'@apollo/server-gateway-interface': patch
'@apollo/server': patch
---

Provide new `GraphQLRequestContext.requestIsBatched` field to gateways, because we did add it in a backport to AS3 and the gateway interface is based on AS3.
