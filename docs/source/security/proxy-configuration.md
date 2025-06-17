---
title: Proxy Configuration
description: Configuring proxy settings for outgoing requests
---

Certain features require Apollo Server to make outgoing requests to Apollo GraphOS or another server in your infrastructure. Depending on security policies, you might need to configure an outgoing HTTP proxy in order to allow these requests. Specifically, the [Usage Reporting](../api/plugin/usage-reporting/) and [Schema Reporting](../api/plugin/schema-reporting/) plugins make requests to Apollo GraphOS, and the [Subscription Callback](../api/plugin/subscription-callback/) plugin makes requests to your GraphOS Router.

While these plugins all allow you to override the `fetcher` function used to make HTTP requests, it is easier to globally configure Node to allow you to configure your HTTP proxy settings via environment variables. The exact mechanism used depends on which version of Apollo Server you are using and what version of Node.js you are using. This page assumes you are using the default fetcher for these plugins rather than overriding the fetcher; if you are overriding the fetcher, you must consult the documentation for the implementation of `fetch` you've selected to learn how it supports HTTP proxies. (It is likely that one of the mechanisms below will still work for you.)

## Configuring AS5 with Node.js v24+ (recommended)

By default, Apollo Server v5 uses [the Node.js built-in `fetch` implementation](https://nodejs.org/api/globals.html#fetch) to make outgoing requests to Apollo GraphOS (for Usage Reporting and Schema Reporting) and to your GraphOS Router (for Subscription Callback). If you are using Node.js v24 or newer, this implementation has built-in support for configuring your HTTP proxy via environment variables.

In order to enable this built-in support, you must set the [`NODE_USE_ENV_PROXY` environment variable](https://nodejs.org/api/cli.html#node_use_env_proxy1) to `1`. You can then use the standard environment variables to configure the proxy:

- `HTTP_PROXY`

  This is the most important environment variable to set, and often the only one you need to set (other than `NODE_USE_ENV_PROXY`). It is the URL of your proxy server.

- `HTTPS_PROXY`

  This variable defines where HTTPS traffic (i.e. encrypted SSL/TLS traffic) is proxied. If this is not set, HTTPS traffic will route through the HTTP proxy.

- `NO_PROXY`

  This variable allows the exclusion of certain domains from being proxied.


## Configuring AS5 with Node.js v20 or v22

If you are running Apollo Server v5 with an older version of Node.js, you need to use a bit of code to enable proxy configuration with the built-in `fetch` implementation instead of setting `NODE_USE_ENV_PROXY`. (Apollo Server v5 does not support the end-of-life versions of Node.js that are older than v20.)

First, install the `undici` library in your app. The built-in `fetch` implementation is based on Undici, but you still need to install the package from the npm registry in order to change this global configuration.

```bash
npm install undici
```

Then, add the following to the top of your main server file, before constructing your `ApolloServer` object.

```ts
import { setGlobalDispatcher, EnvHttpProxyAgent } from 'undici'

setGlobalDispatcher(new EnvHttpProxyAgent());
```

You can now configure Apollo Server with the `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` environment variables, as documented above. (You do not have to set `NODE_USE_ENV_PROXY`.)


## Configuring AS4

By default, Apollo Server v4 uses the [`node-fetch` npm package](https://www.npmjs.com/package/node-fetch) instead of the built-in Node.js `fetch` implementation to make requests to Apollo GraphOS. (Despite the similar names, these are completely different implementations.) This is implemented in terms of the Node.js HTTP `request` API, not its `fetch` API, and configuring this API to use HTTP proxies works differently.

Although Apollo Server supports standard Node.js "agent" configuration via [`https.globalAgent`](https://nodejs.org/api/https.html#https_https_globalagent) and [`http.globalAgent`](https://nodejs.org/api/http.html#http_http_globalagent) directly, we recommend using the [`global-agent`](https://github.com/gajus/global-agent#global-agent) package to reduce the amount of necessary configuration involved with [creating a custom agent](https://nodejs.org/api/http.html#http_class_http_agent).

First, install the `global-agent` package:

```
npm install global-agent
```

Invoke its `bootstrap` method **before** Apollo Server is initialized:

```ts
import { ApolloServer } from '@apollo/server';
import { bootstrap } from 'global-agent'; // highlight-line

// Set up global support for environment variable based proxy configuration.
bootstrap(); // highlight-line

// The following represents existing configuration, though it is
// important to bootstrap the agent before Apollo Server.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

You can configure the proxy with the `GLOBAL_AGENT_HTTP_PROXY`, `GLOBAL_AGENT_HTTPS_PROXY`, and `GLOBAL_AGENT_NO_PROXY` environment variables, which work identically to the environment variables documented above without the `GLOBAL_AGENT_` prefix.

If you would prefer to use environment variable names without the `GLOBAL_AGENT_` prefix (e.g., if `HTTP_PROXY` is already set in your environment), you can set the `GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE` environment variable to the empty string.

## Specifying a custom SSL/TLS certificate

Depending on the proxy communication, it may be necessary to extend the default "root" certificates which Node.js trusts to include a certificate provided by the proxy administrator. These certificates will usually allow the proxy to handle SSL/TLS traffic and permit the proxy to analyze such traffic.

This can be done [via Node.js' `NODE_EXTRA_CA_CERTS` environment variable](https://nodejs.org/api/cli.html#cli_node_extra_ca_certs_file):

1. The appropriate certificate (i.e. PEM file) must be present on the file-system where the server is running.
2. Start the server with the `NODE_EXTRA_CA_CERTS` environment variable set to that path, combined with the existing proxy configuration variables which were explained above:

```shell
$ NODE_EXTRA_CA_CERTS=/full/path/to/certificate.pem \
  NODE_USE_ENV_PROXY=1 \
  HTTP_PROXY=http://proxy:3128/ \
  node index.js
```
