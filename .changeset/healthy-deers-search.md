---
'@apollo/server': patch
---

`HTTPGraphQLRequest` now uses a specific `HeaderMap` class which we export instead of allowing a standard `Map`. The `HeaderMap` downcases all incoming keys, as header names are not case-sensitive.
