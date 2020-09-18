---
title: Migrating from the "engine" option
---

Apollo Server v2.18 deprecates the `engine` option to the `ApolloServer` constructor and provides a new way of configuring its communication with Apollo Studio. The `engine` option continues to work for existing functionality, but you will eventually want to update to the new API. If you don't explicitly pass `engine` to the `ApolloServer` constructor, you don't have to do anything.

Apollo Server ships with several plugins that help it integrate with Apollo Studio: the [usage reporting plugin](./api/plugin/usage-reporting/) plugin, the [schema reporting plugin](./api/plugin/schema-reporting/), and the [inline trace plugin](./api/plugin/inline-trace/). Apollo Server has some heuristics to install these plugins by default in certain circumstances (documented in the individual plugin reference pages), but otherwise they are standard [Apollo Server plugins](./integrations/plugins/). They are configured by passing arguments to the constructor functions. Some overall graph configuration (such as your graph API key and graph variant name) is set via the `apollo` option to the `ApolloServer` constructor (or via environment variables).

Before Apollo Server v2.18, all this functionality built directly inside Apollo Server, and all of it was configured via the `engine` option to the `ApolloServer` constructor. While the `engine` option does continue to work for backwards compatibility, new configuration options will only be added to the plugins directly. To make it easier to undersatnd where configuration is coming from, you cannot mix and match the `engine` option with the three new plugins or the `apollo` option; if you want to start configuring the plugins directly you need to migrate all of your usage of the `engine` option to the plugin functions. Fortunately, this is relatively straightforward; most `engine` options correspond directly to an option passed to one of the plugins or on the `apollo` option to `ApolloServer`.  This page lists the options on `engine` and explains how to migrate them to the Studio integration plugins.

If you don't explicitly pass `engine` to your `ApolloServer` constructor, you don't need to make any changes! Specifically, configuration via the environment variables `APOLLO_KEY` (and its legacy equivalent `ENGINE_API_KEY`), `APOLLO_GRAPH_VARIANT` (and its legacy equivalent `ENGINE_SCHEMA_TAG`), and `APOLLO_SCHEMA_REPORTING` has not changed at all.

(There is one minor change in v2.18 that happens if you don't use any of this Studio integration: upgrading to Apollo Server v2.18 will make `ApolloServer` start registering `SIGINT` and `SIGTERM` signal handlers which invoke `ApolloServer.stop()` when those signals are received. Previously these handlers were only registered when you use Studio usage or schema reporting. If this is a problem for you, disable the handlers by passing `stopOnTerminationSignals: false` to the `ApolloServer` constructor.)

## Migration example

Here's a high level example showing how to migrate off of the `engine` option. Let's say your `ApolloServer` constructor looked like this, and you already set your API key using `$APOLLO_KEY`:

```js
import { ApolloServer } from 'apollo-server-express';

function rewriteError(err) {
  if (err.message.matches(/hide-me/)) {
    return null;
  }
  return err;
}

function reportTiming(requestContext) {
  return requestContext.request.http?.headers?.get('no-report') !== 'true';
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    graphVariant: 'prod',
    handleSignals: false,
    rewriteError,
    reportTiming,
    privateVariables: ['foo', 'bar'],
    reportSchema: true,
    schemaReportingInitialDelayMaxMs: 30 * 1000,
  },
});
```

You can rewrite this as:

```js
import { ApolloServer } from 'apollo-server-express';
// The plugins are always imported from apollo-server-core, no matter which
// framework you use.
import {
  ApolloServerPluginUsageReporting,
  ApolloServerPluginSchemaReporting,
} from 'apollo-server-core';

function rewriteError(err) {
  if (err.message.matches(/hide-me/)) {
    return null;
  }
  return err;
}

function includeRequest(requestContext) {
  return requestContext.request.http?.headers?.get('no-report') !== 'true';
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  apollo: {
    // You can also just set $APOLLO_GRAPH_VARIANT.
    graphVariant: 'prod',
  },
  stopOnTerminationSignals: false,
  plugins: [
    ApolloServerPluginUsageReporting({
      rewriteError,
      includeRequest,
      sendVariableValues: { exceptNames: ['foo', 'bar'] },
    }),
    ApolloServerPluginSchemaReporting({
      initialDelayMaxMs: 30 * 1000,
    }),
  ],
});
```

## Options that move to `apollo`

Two `engine` options move to the new [`apollo` option to the `ApolloServer` constructor](./api/apollo-server/#apollo). `engine.apiKey` becomes `apollo.key`, and `engine.graphVariant` becomes `apollo.graphVariant`. `engine.schemaTag` was a previous name for `engine.graphVariant`, so uses of that field should also change to `apollo.graphVariant` (`apollo.schemaTag` is not supported).

```js
// This code...
const server = new ApolloServer({
  engine: {
    apiKey: 'service:xxx:yyy',
    graphVariant: 'production',
  },
});

// ... is equivalent to this code.
const server = new ApolloServer({
  apollo: {
    key: 'service:xxx:yyy',
    graphVariant: 'production',
  },
});
```

Note that these two options are often specified via environment variable: the API key can be specified as `APOLLO_KEY` (or its legacy equivalent `ENGINE_API_KEY`), and the graph variant can be specified as `APOLLO_GRAPH_VARIANT` (or its legacy equivalent `ENGINE_SCHEMA_TAG`). Apollo Server v2.18 does not change this behavior.


## Options that move to the `ApolloServer` constructor

Prior to Apollo Server v2.18, the usage reporting functionality registered one-shot handlers for the `SIGINT` and `SIGTERM` signals, which it used to send one final usage report before re-sending the signal to itself to continue shutdown. These signals handlers were installed by default if you enabled usage or schema reporting, and could be disabled by passing `engine.handleSignals: false`.

In Apollo Server v2.18, termination signal handling is the responsibility of Apollo Server as a whole rather than something specific to usage reporting. Apollo Server itself now registers these one-shot signal handlers, which trigger `ApolloServer.stop()`. This allows any plugin that implements the new `serverWillStop` callback to hook into shutdown logic, not just the usage reporting code.

Similarly to before, these signal handlers are registered by default but can be disabled by via an option. We've changed the option name to `stopOnTerminationSignals: false` as it is more explicit about the behavior.

```js
// This code...
const server = new ApolloServer({
  engine: {
    handleSignals: false,
  },
});

// ... is equivalent to this code.
const server = new ApolloServer({
  stopOnTerminationSignals: false,
});
```


## Options for `ApolloServerPluginUsageReporting`

The majority of `engine` options configure how usage reporting works. Many of them can be moved directly to a call to [`ApolloServerPluginUsageReporting`](./api/plugin/usage-reporting/) in the `plugins` array.

These `engine` options work exactly like the `ApolloServerPluginUsageReporting` options of the same name:

- `calculateSignature`
- `debugPrintReports`
- `endpointUrl`
- `generateClientInfo`
- `maxAttempts`
- `maxUncompressedReportSize`
- `minimumRetryDelayMs`
- `reportErrorFunction`
- `reportIntervalMs`
- `requestAgent`
- `rewriteError`
- `sendHeaders`
- `sendReportsImmediately`
- `sendVariableValues`

The `engine` option `tracesEndpointUrl` was another name for `endpointUrl` and also becomes the `ApolloServerPluginUsageReporting` option `endpointUrl`.

The `engine` option `reportTiming` can be either a function or a boolean. If you passed a function here, you can pass the same function as the `includeRequest` option to `ApolloServerPluginUsageReporting`. If you passed `true` here, you don't need to do anything special: this just means to enable usage reporting, which is the default if an API key is provided. If you passed `false` here, that means you didn't want usage reporting even though you've configured `ApolloServer` with an API key (perhaps you only want schema reporting); in that case, you should use the `ApolloServerPluginUsageReportingDisabled` plugin (see example below).

The `engine` option `maskErrorDetails` was deprecated in Apollo Server 2.5 and replaced by `rewriteError`. While `engine.maskErrorDetails` still works for backwards compatibility, there is no `maskErrorDetails` option to `ApolloServerPluginUsageReporting`. If you previously passed `engine.maskErrorDetails`, you can instead pass `rewriteError: () => new GraphQLError('<masked>')` to `ApolloServerPluginUsageReporting`.

The `privateVariables` and `privateHeaders` `engine` options were deprecated in Apollo Server 2.7 and replaced by `sendVariableValues` and `sendHeaders`. While they still work on `engine` for backwards compatibility, you need to use the newer version if calling `ApolloServerPluginUsageReporting` directly.

- `engine.privateVariables: true` is equivalent to `sendVariableValues: { none: true }`
- `engine.privateVariables: false` is equivalent to `sendVariableValues: { all: true }`
- `engine.privateVariables: ['x', 'y']` is equivalent to `sendVariableValues: { exceptNames: ['x', 'y'] }`

`engine.privateHeaders` values can be translated to `sendHeaders` values in the same way.

```js
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginUsageReporting,
  ApolloServerPluginUsageReportingDisabled,
} from 'apollo-server-core';

// This code...
const server = new ApolloServer({
  engine: {
    reportTiming: (requestContext) => ...,
    sendReportsImmediately: true,
    maskErrorDetails: true,
    privateHeaders: ['my-api-key'],
  },
});

// ... is equivalent to this code.
const server = new ApolloServer({
  plugins: [ApolloServerPluginUsageReporting({
    includeRequest: (requestContext) => ...,
    sendReportsImmediately: true,
    rewriteError: () => new GraphQLError('<masked>'),
    sendHeaders: { exceptNames: ['my-api-key'] },
  })],
});


// This code...
const server = new ApolloServer({
  engine: {
    reportTiming: false,
  },
});

// ... is equivalent to this code.
const server = new ApolloServer({
  plugins: [ApolloServerPluginUsageReportingDisabled()],
});
```

## Options for `ApolloServerPluginSchemaReporting`

A few `engine` options configure how schema reporting works.

The `engine.reportSchema` option (or its legacy equivalent `engine.experimental_schemaReporting`) is replaced by the choice of whether or not to include the schema reporting plugin at all. If you passed `true` for either of these options, you'll want to add a call to [`ApolloServerPluginSchemaReporting()`](./api/plugin/schema-reporting/) to your `plugins` array. Alternatively, you can set the `APOLLO_SCHEMA_REPORTING` environment variable to `true`, which will have the saem effect. If you passed `false` for either of these options, just don't call `ApolloServerPluginSchemaReporting` at all (and don't set the environment variable.

The `engine.overrideReportedSchema` option (and its legacy equivalent `engine.experimental_overrideReportedSchema`) works exactly like the `overrideReportedSchema` option to `ApolloServerPluginSchemaReporting`. However, **if you want to configure this option, you should also pass the same value to `ApolloServerPluginUsageReporting`'s option of the same name**, so that schema IDs match up between your schema and usage reporting. This may require adding a call to `ApolloServerPluginUsageReporting` if you were otherwise depending on its default behavior.

The `engine.schemaReportingInitialDelayMaxMs` option (and its legacy equivalent `engine.experimental_schemaReportingInitialDelayMaxMs`) works exactly like the `initialDelayMaxMs` option to `ApolloServerPluginSchemaReporting`.

The `engine.schemaReportingUrl` option works exactly like the `endpointUrl` option to `ApolloServerPluginSchemaReporting`.

```js
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginSchemaReporting,
  ApolloServerPluginUsageReporting,
} from 'apollo-server-core';

// This code...
const server = new ApolloServer({
  engine: {
    reportSchema: true,
  },
});

// ... is equivalent to this code. (Or you can just set
// $APOLLO_SCHEMA_REPORTING to 'true'.)
const server = new ApolloServer({
  plugins: [ApolloServerPluginSchemaReporting()],
});


// This code...
const server = new ApolloServer({
  engine: {
    reportSchema: true,
    overrideReportedSchema: SCHEMA_TEXT,
  },
});

// ... is equivalent to this code.
const server = new ApolloServer({
  plugins: [
    ApolloServerPluginUsageReporting({
      overrideReportedSchema: SCHEMA_TEXT,
    }),
    ApolloServerPluginSchemaReporting({
      overrideReportedSchema: SCHEMA_TEXT,
    }),
  ],
});
```

## Options for `ApolloServerPluginInlineTrace`

By default, Apollo Server [enables inline tracing on federated implementing services](./api/plugin/inline-trace/). One `engine` option can be used to configure how inline tracing works. If you specified the `engine.rewriteError` function **and your service is an implementing service that is combined with others via federation** (but not if this server is the Apollo gateway which combines multiple implementing services), then you should pass that `rewriteError` function to the `ApolloServerPluginInlineTrace` plugin function. Note that `engine.rewriteError` is also (more commonly) used with graphs that report directly to Apollo's servers with via the usage reporting plugin; you shouldn't add the inline trace plugin unless you're sure you're in a federated implementing service!

```js
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginInlineTrace, } from 'apollo-server-core';

// This code...
const server = new ApolloServer({
  engine: {
    rewriteError: (err) => ...,
  },
});

// ... is equivalent to this code, IF THIS IS A
// FEDERATED IMPLEMENTING SERVICE.
const server = new ApolloServer({
  plugins: [ApolloServerPluginInlineTrace({
    rewriteError: (err) => ...
  })],
});
```

Note that the default behavior of whether inline tracing is enabled changed in v2.18.  In v2.18, inline tracing is enabled for any federated implementing service, unless explicitly disabled with `ApolloServerPluginInlineTraceDisabled`. In previous versions, inline tracing was enabled for any federated implementing service *unless an Apollo API key was provided*; this special case is removed in v2.18, which means that the same graph can both report usage to Apollo's servers and include inline traces in responses. These functionalities also both now log at startup, so it should be easy to see if they are unintentionally simultaneously enabled.


## Migrating from `engine: false`

If you passed `engine: false` to the `ApolloServer` constructor, the main effect was to disable inline tracing even if the current graph is a federated implementing service.

Prior to Apollo Server 2.13, this also had the effect of disabling usage reporting even if you configured an API key. The change in Apollo Server 2.13 appears to have been unintentional and the backwards-compatibility handling of `engine: false` in Apollo Server TODO(no-engine) restores the old behavior of disabling usage reporting.

If your code had `engine: false` because it is a federated implementing service but you do not want to enable inline tracing, you should use the new `ApolloServerPluginInlineTraceDisabled` plugin instead:


```js
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core';

// In a federated implementing service, this code...
const server = new ApolloServer({
  engine: false,
});

// ... is equivalent to this code.
const server = new ApolloServer({
  plugins: [ApolloServerPluginInlineTraceDisabled()],
});
```

If your code had `engine: false` because you wanted to disable usage reporting even though you are passing in an Apollo graph API key (via `$APOLLO_KEY` or `$ENGINE_API_KEY`), you should use the new `ApolloServerPluginUsageReportingDisabled` plugin instead. (However, be aware that usage reporting was not actually disabled by `engine: false` starting with Apollo Server 2.13.)

```js
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginUsageReportingDisabled } from 'apollo-server-core';

// When $APOLLO_KEY or $ENGINE_API_KEY is set, this code...
const server = new ApolloServer({
  engine: false,
});

// ... is equivalent to this code.
const server = new ApolloServer({
  plugins: [ApolloServerPluginUsageReportingDisabled()],
});
```


Passing `engine: true` to the `ApolloServer` constructor was allowed but did not have a different effect from not passing `engine` at all.
