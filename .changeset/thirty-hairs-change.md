---
"@apollo/server": minor
---

allow `stringifyResult` to return a `Promise<string>`

Users who implemented the `stringifyResult` hook can now expect error responses to be formatted with the hook as well. Please take care when updating to this version to ensure this is the desired behaviour, or implement the desired behaviour accordingly in your `stringifyResult` hook. This was considered a non-breaking change as we consider that it was an oversight in the original PR that introduced `stringifyResult` hook.
