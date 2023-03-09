---
'@apollo/server': patch
---

Bug fix: tldr revert a previous change that stops passing includeCookies from the prod landing page config.

Who was affected? 

Any Apollo Server instance that passes a `graphRef` to a production landing page with a non-default `includeCookies` value that does not match the `Include cookies` setting on your registered variant on studio.apollographql.com.

How were they affected?

From release 4.4.0 to this patch release, folks affected would have seen their Explorer requests being sent with cookies included only if they had set `Include cookies` on their variant. Cookies would not havhe been included by default.
