---
'@apollo/server': patch
---

Previously, when users provided their own `documentStore`, Apollo Server used a random prefix per schema in order to guarantee there was no shared state from one schema to the next. Now Apollo Server uses a hash of the schema, which enables the provided document store to be shared if you choose to do so.
