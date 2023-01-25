---
'@apollo/server': patch
---

Errors reported by subgraphs (with no trace data in the response) are now accurately reflected in the numeric error stats.

Operations that receive errors from subgraphs (with no trace data in the response) are no longer sent as incomplete, error-less traces.
