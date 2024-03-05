---
"@apollo/server": patch
---

Improves timing of the `willResolveField` end hook on fields which return Promises resolving to Arrays. This makes the use of the `setCacheHint` method more reliable.
