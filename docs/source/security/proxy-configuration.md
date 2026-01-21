---
title: Proxy Configuration
description: Configuring proxy settings for outgoing requests
---

Certain features require Apollo Server to make outgoing requests to Apollo GraphOS or another server in your infrastructure. Depending on security policies, you might need to configure an outgoing HTTP proxy in order to allow these requests. Specifically, the [Usage Reporting](../api/plugin/usage-reporting/) and [Schema Reporting](../api/plugin/schema-reporting/) plugins make requests to Apollo GraphOS, and the [Subscription Callback](../api/plugin/subscription-callback/) plugin makes requests to your GraphOS Router.

You can override the `fetcher` function these plugins use to make HTTP requests. This page assumes you're using the default fetcher. If you're overriding the fetcher, check the documentation for the implementation of `fetch` you've selected to learn how it supports HTTP proxies.

We recommend using environment variables to configure Node.js and HTTP proxy settings.

## Proxy configuration variables

You can use the following environment variables to configure the proxy:

- `HTTP_PROXY`

  The URL of your proxy server.

- `HTTPS_PROXY`

  The URL where HTTPS traffic (i.e. encrypted SSL/TLS traffic) is proxied. If this is not set, HTTPS traffic will route through the HTTP proxy.

- `NO_PROXY`

  A comma-separated list of domains that should be excluded from being proxied. For example, `'*.foo.com,10.0.1.100,baz.com'`.

If you are using AS4, the environment variables need to be prefixed with `GLOBAL_AGENT_` (for example, `GLOBAL_AGENT_HTTP_PROXY`, `GLOBAL_AGENT_HTTPS_PROXY` and `GLOBAL_AGENT_NO_PROXY`).

To enable the use of these environment variables, refer to the sections below for instructions specific to your Apollo Server and Node.js versions.

## Configuring AS5 with Node.js v24+ (recommended)

By default, Apollo Server v5 uses [the Node.js built-in `fetch` implementation](https://nodejs.org/api/globals.html#fetch).

If you are using Node.js v24 or newer, this implementation has built-in support for configuring your HTTP proxy via environment variables. You can enable this using the [`NODE_USE_ENV_PROXY` environment variable](https://nodejs.org/api/cli.html#node_use_env_proxy1).

```bash
NODE_USE_ENV_PROXY=1
```

You can now use the proxy configuration variables defined above.

## Configuring AS5 with Node.js v20 or v22

If you are running Apollo Server v5 with Node.js v20 or v22, you need to use a bit of code to enable proxy configuration with the built-in `fetch` implementation.

First, install the `undici` library in your app. The built-in `fetch` implementation is based on [Undici](https://www.npmjs.com/package/undici), but you still need to install the package from the npm registry in order to change this global configuration.

```bash
npm install undici
```

Then, add the following to the top of your main server file, before constructing your `ApolloServer` object.

```ts
import { setGlobalDispatcher, EnvHttpProxyAgent } from 'undici'

setGlobalDispatcher(new EnvHttpProxyAgent());
```

You can now use the proxy configuration variables defined above. (You don't need to set `NODE_USE_ENV_PROXY`.)

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

You can configure the proxy with the `GLOBAL_AGENT_HTTP_PROXY`, `GLOBAL_AGENT_HTTPS_PROXY`, and `GLOBAL_AGENT_NO_PROXY` environment variables, which work identically to the environment variables defined above.

If you would prefer to use environment variable names without the `GLOBAL_AGENT_` prefix (e.g., if `HTTP_PROXY` is already set in your environment), you can set the `GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE` environment variable to an empty string.

```
GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE=""
```

You can now use the proxy configuration variables defined above.

## Specifying a custom SSL/TLS certificate

Depending on the proxy communication, it may be necessary to extend the default "root" certificates which Node.js trusts to include a certificate provided by the proxy administrator. These certificates will usually allow the proxy to handle SSL/TLS traffic and permit the proxy to analyze such traffic.

This can be done [via Node.js' `NODE_EXTRA_CA_CERTS` environment variable](https://nodejs.org/api/cli.html#cli_node_extra_ca_certs_file):

1. The appropriate certificate (i.e. PEM file) must be present on the file-system where the server is running.
2. Start the server with the `NODE_EXTRA_CA_CERTS` environment variable set to that path, combined with the proxy configuration variables defined above.

```shell
$ NODE_EXTRA_CA_CERTS=/full/path/to/certificate.pem \
  NODE_USE_ENV_PROXY=1 \
  HTTP_PROXY=http://proxy:3128/ \
  node index.js
```
