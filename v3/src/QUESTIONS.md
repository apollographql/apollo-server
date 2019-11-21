## Should we use `??` over `||` as a matter of style?

I think there's a performance implication—`||` is in the language, `??` requires more checks. But maybe it's worth it for safety? Specifically inspired by this line in `loc.ts`:

```ts
const loc = getLocation(at) || new Error
```

Where we know that `getLocation` will only return an Error or undefined, so `||` is safe.
