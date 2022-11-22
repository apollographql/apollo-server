---
'@apollo/server': minor
---

Don't automatically install the usage reporting plugin in servers that appear to be hosted a federated subgraph (based on the existence of a field `_Service.sdl: String`). This is generally a misconfiguration. If an API key and graph ref is provided to a subgraph, log a warning and do not enable the usage reporting plugin. If the usage reporting plugin is explicitly installed in a subgraph, log a warning but keep it enabled.
