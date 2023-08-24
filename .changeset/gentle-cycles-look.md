---
'@apollo/server': patch
---

Fix error path attachment for list items

Previously, when errors occurred while resolving a list item, the trace builder would fail to place the error at the correct path and just default to the root node with a warning message:

> `Could not find node with path x.y.1, defaulting to put errors on root node.`

This change places these errors at their correct paths and removes the log.
