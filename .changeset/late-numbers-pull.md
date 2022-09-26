---
'@apollo/server': patch
---

Update `validationRules` typing for correctness. This is sort of a breaking change for TS users in that the types were more permissive than they should have been. All `validationRules` list items should conform to the `graphql-js` `ValidationRule` type.
