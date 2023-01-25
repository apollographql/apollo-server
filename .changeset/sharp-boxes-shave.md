---
'@apollo/server': patch
---

Pin `node-abort-controller` version to avoid breaking change. Apollo Server users can enter a broken state if they update their package-lock.json due to a breaking change in a minor release of the mentioned package.

Ref: https://github.com/southpolesteve/node-abort-controller/issues/39
