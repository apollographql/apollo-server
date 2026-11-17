---
'@apollo/server-gateway-interface': minor
---

Widen the `@apollo/utils.fetcher`, `@apollo/utils.logger` and `@apollo/utils.keyvaluecache` dependency ranges to also accept the majors that `@apollo/gateway` 2.x uses (`^2.0.0 || ^3.0.0`, `^2.0.0 || ^3.0.0` and `^2.1.0 || ^3.0.0 || ^4.0.0`). This package only uses types from those packages, and the types it uses are the same across those majors. Projects that already have the older `@apollo/utils.*` versions installed (such as `@apollo/gateway` without Apollo Server 5) no longer pull in a second copy, which also means `@apollo/gateway` can depend on this package's 2.x line without raising its Node.js requirement.
