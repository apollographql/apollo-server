---
title: Proxy Configuration
description: Configuring proxy settings for outgoing requests
---

Certain features of the Apollo platform (such as [managed federation](https://www.apollographql.com/docs/federation/managed-federation/overview/)) require Apollo Server to make outgoing requests to Apollo Studio. Depending on security policies, you might need to configure an outgoing HTTP proxy in order to allow these requests.

Although Apollo Server supports standard Node.js "agent" configuration via [`https.globalAgent`](https://nodejs.org/api/https.html#https_https_globalagent) and [`http.globalAgent`](https://nodejs.org/api/http.html#http_http_globalagent) directly, we recommend using the [`global-agent`](https://github.com/gajus/global-agent#global-agent) package to reduce the amount of necessary configuration involved with [creating a custom agent](https://nodejs.org/api/http.html#http_class_http_agent).

The `global-agent` package enables the common technique of setting proxy settings using environment variables (e.g. `HTTP_PROXY`, `NO_AGENT`, etc.), which is not supported by Node.js itself (and [may never be](https://github.com/nodejs/node/issues/15620)).

## Configuring the proxy agent

This guide covers the `global-agent` package, which is supported by Node.js version 10 and later.

### Installing the `global-agent` dependency

First, install the `global-agent` package with your dependency manager:

```
npm install global-agent
```

### Bootstrapping the `global-agent` proxy agent

After the `global-agent` dependency has been installed, invoke its `bootstrap` method **before** Apollo Server is initialized:

```ts
import { ApolloServer } from '@apollo/server';
import { bootstrap } from 'global-agent'; // highlight-line

// Setup global support for environment variable based proxy configuration.
bootstrap(); // highlight-line

// The following represents existing configuration, though its
// important to bootstrap the agent before Apollo Server.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

### Configuring the proxy using environment variables

Depending on the deployment environment (e.g. AWS, Heroku, Kubernetes, Docker, etc.), environment variables may be set differently. These instructions will demonstrate how to start a `node` process using environment variables in a Unix-based shell.

By default, the above bootstrapping step will enable the following environment variables:

- `GLOBAL_AGENT_HTTP_PROXY`

  This is often the most important and solely necessary environment variable to set.

- `GLOBAL_AGENT_HTTPS_PROXY`

  This variable defines where HTTPS traffic (i.e. encrypted SSL/TLS traffic) is proxied. If this is not set, HTTPS traffic will route through the HTTP proxy.

- `GLOBAL_AGENT_NO_PROXY`

  This variable allows the exclusion of certain domains from being proxied.

By setting these environment variables, it is possible to configure `global-agent`'s creation of the agent that is used for outgoing requests. If the proxy requires special certificates for SSL/TLS requests, read the details later in this page.

Using the appropriate environment variables, define them when starting the server. For example, to send all outgoing requests from a Node.js server through `http://proxy:3128`, the configuration would be:

```shell
$ GLOBAL_AGENT_HTTP_PROXY=http://proxy:3128/ node index.js
```

The `GLOBAL_AGENT_NO_PROXY` environment variable can also be defined to exclude certain URLs from being proxied:

```shell
$ GLOBAL_AGENT_NO_PROXY='*.foo.com,10.0.1.100,baz.com' node index.js
```

> For more information, see [Exclude URLs](https://github.com/gajus/global-agent#exclude-urls) in the `global-agent` documentation.

As shown above, the [supported environment variables](https://github.com/gajus/global-agent#environment-variables) are all prefixed with `GLOBAL_AGENT_` to avoid [undesirable by-products](https://github.com/gajus/global-agent#what-is-the-reason-global-agentbootstrap-does-not-use-http_proxy) of using the more common non-prefixed versions (e.g. `HTTP_PROXY`). To disable this default namespacing (i.e. prefixing), the server can be started with `GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE` set to an empty string:

```shell
$ GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE="" HTTP_PROXY=http://proxy:3128/ node index.js
```

Of course, a custom namespace can also be provided as well. For more details on the configuration, see [the documentation for `global-agent`](https://github.com/gajus/global-agent#global-agent).

## Specifying a custom SSL/TLS certificate

Depending on the proxy communication, it may be necessary to extend the default "root" certificates which Node.js trusts to include a certificate provided by the proxy administrator. These certificates will usually allow the proxy to handle SSL/TLS traffic and permits the proxy to analyze such traffic.

This can be done [via Node.js' `NODE_EXTRA_CA_CERTS` environment variable](https://nodejs.org/api/cli.html#cli_node_extra_ca_certs_file):

1. The appropriate certificate (i.e. PEM file) must be present on the file-system where the server is running.
2. Start the server with the `NODE_EXTRA_CA_CERTS` environment variable set to that path, combined with the existing proxy configuration variables which were explained above:

```shell
$ NODE_EXTRA_CA_CERTS=/full/path/to/certificate.pem \
  GLOBAL_AGENT_HTTP_PROXY=http://proxy:3128/ \
  node index.js
```
