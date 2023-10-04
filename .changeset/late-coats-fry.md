---
'@apollo/server': patch
---

The minimum version of `graphql` officially supported by Apollo Server 4 as a peer dependency, v16.6.0, contains a [serious bug that can crash your Node server](https://github.com/graphql/graphql-js/issues/3528). This bug is fixed in the immediate next version, `graphql@16.7.0`, and we **strongly encourage you to upgrade your installation of `graphql` to at least v16.7.0** to avoid this bug. (For backwards compatibility reasons, we cannot change Apollo Server 4's minimum peer dependency, but will change it when we release Apollo Server 5.)

Apollo Server 4 contained a particular line of code that makes triggering this crashing bug much more likely. This line was already removed in Apollo Server v3.8.2 (see #6398) but the fix was accidentally not included in Apollo Server 4.  We are now including this change in Apollo Server 4, which will **reduce** the likelihood of hitting this crashing bug for users of `graphql` v16.6.0.  That said, taking this `@apollo/server` upgrade does not **prevent** this bug from being triggered in other ways, and the real fix to this crashing bug is to upgrade `graphql`.
