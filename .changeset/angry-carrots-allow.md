---
"@apollo/server": patch
---

Subscription heartbeats are initialized prior to awaiting subscribe(). This allows long-running setup to happen in the returned Promise without the subscription being terminated prior to resolution.
