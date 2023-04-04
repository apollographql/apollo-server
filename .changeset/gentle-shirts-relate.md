---
'@apollo/server': patch
---

Improve bad 'accept' header error message

It's not obvious that users can bypass content-type negotiation within Apollo Server if they want to use a content-type that isn't exactly one of the two we prescribe. This improves the error message so that users understand how to skip AS's negotiation step if they choose to use a custom content-type.
