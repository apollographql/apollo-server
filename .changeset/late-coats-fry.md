---
'@apollo/server': patch
---

Fix usage reporting plugin "willResolveField called after stopTiming!" error caused by a race condition related to null bubbling. Forward port of #6398.
