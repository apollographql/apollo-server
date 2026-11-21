---
'@apollo/server': major
---

Remove the `status400ForVariableCoercionErrors` constructor option. Variable coercion errors always receive a 400 status code (the default since Apollo Server 5); setting the option to `false` is no longer supported.
