---
"@apollo/server": patch
---

In the subscription callback server plugin, terminating a subscription now immediately closes the internal async generator. This avoids that generator existing after termination and until the next message is received.
