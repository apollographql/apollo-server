---
title: "API Reference: ApolloServerPluginUsageReporting"
sidebar_title: ApolloServerPluginUsageReporting
api_reference: true
---

## Using the plugin

This API reference documents the `ApolloServerPluginUsageReporting` plugin.

This plugin instruments your server to keep track of how your clients use your GraphQL schema. It tracks per-field and per-operation usage and sends reports of summarized statistics and full performance traces to Apollo's servers. You can explore your graph's usage in [Apollo Studio](https://www.apollographql.com/docs/studio/). More information on this feature along with common patterns can be found under [metrics and logging](../../monitoring/metrics/).

In order to use this plugin, you must [configure your server with a graph API key](https://www.apollographql.com/docs/apollo-server/monitoring/metrics/#connecting-to-apollo-studio), either with the `APOLLO_KEY` environment variable or by passing it directly to your `ApolloServer` with `new ApolloServer({apollo: {key: KEY}})`.

If you do provide an API key to `ApolloServer`, then by default it will enable usage reporting and install an instance of this plugin with its default configuration.  So if you do not want to further configure your `ApolloServer`, all you need to do is set `APOLLO_KEY` and usage reporting will work.

If you want to configure the usage reporting plugin, import it from the `apollo-server-core` package and pass it to your `ApolloServer` in the `plugins` array:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginUsageReporting } from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginUsageReporting({
      sendVariableValues: { all: true },
    }),
  ],
});
```

If you don't want to use the usage reporting plugin even though you've provided an API key, you can explicitly disable it with the `ApolloServerPluginUsageReportingDisabled` plugin:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginUsageReportingDisabled } from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginUsageReportingDisabled()],
});
```

This plugin was introduced in Apollo Server 2.18. In previous versions, usage reporting was configured using the `engine` option to the `ApolloServer` constructor. That option continues to work; see [the migration guide](../../migration-engine-plugins/) for details.

## Options

<table class="field-table">
  <thead>
    <tr>
      <th>Name /<br/>Type</th>
      <th>Description</th>
    </tr>
  </thead>

<tbody>
<tr>
<td colspan="2">

**Configure exactly which data should be sent to Apollo**
</td>
</tr>

<tr>
<td>

###### `sendVariableValues`

`Object`
</td>
<td>

By default, Apollo Server does not send the values of any GraphQL variables to Apollo's servers, because variable values often contain the private data of your app's users. If you'd like variable values to be included in traces, set this option. This option can take several forms:

- `{ none: true }`: don't send any variable values (default)
- `{ all: true }`: send all variable values
- `{ transform: ... }`: a custom function for modifying variable values. Keys added by the custom function will be removed, and keys removed will be added back with an empty value. For security reasons, if an error occurs within this function, all variable values will be replaced with `[PREDICATE_FUNCTION_ERROR]`.
- `{ exceptNames: [...] }`: a case-sensitive list of names of variables whose values should not be sent to Apollo servers
- `{ onlyNames: [...] }`: A case-sensitive list of names of variables whose values will be sent to Apollo servers

The report will indicate each private variable key whose value was redacted by `{ none: true }` or `{ exceptNames: [...] }`.
</td>
</tr>

<tr>
<td>

###### `sendHeaders`

`Object`
</td>
<td>

By default, Apollo Server does not send the list of HTTP headers and values to Apollo's servers, as these headers may contain your users' private data. If you'd like this information included in traces, set this option. This option can take several forms:

- `{ none: true }`: drop all HTTP request headers (default)
- `{ all: true }`: send the values of all HTTP request headers
- `{ exceptNames: [...] }`: case-insensitive list of names of HTTP headers whose values should not be sent to Apollo servers
- `{ onlyNames: [...] }`: A case-insensitive list of names of HTTP headers whose values will be sent to Apollo servers

Unlike with `sendVariableValues`, names of dropped headers are not reported. The headers `authorization`, `cookie`, and `set-cookie` are never reported.
</td>
</tr>

<tr>
<td>

###### `rewriteError`

`Function`
</td>
<td>

By default, all errors get reported to Apollo servers. You can specify a filter function to exclude specific errors from being reported by returning an explicit `null`, or you can mask certain details of the error by modifying it and returning the modified error. This function has type `(GraphQLError) => GraphQLError | null`. (Note that if this server is an Apollo Gateway, this will not affect errors from federated implementing services; to rewrite these errors, configure the [option of the same name in the inline trace plugin](./inline-trace/#rewriteerror) in the implementing service's Apollo Server).)
</td>
</tr>

<tr>
<td>

###### `includeRequest`

`Function`
</td>
<td>

This option allows you to choose if a particular request should be represented in the usage reporting sent to Apollo servers. By default, all requests are included. If this *async* predicate function is specified, its return value will determine whether a given request is included.

The predicate function receives the request context. If validation and parsing of the request succeeds, the function will receive the request context in the [`GraphQLRequestContextDidResolveOperation`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didresolveoperation) phase, which permits tracing based on dynamic properties, e.g., HTTP headers or the `operationName` (when available). Otherwise it will receive the request context in the [`GraphQLRequestContextDidEncounterError`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didencountererrors) phase. In either case, it should return a `Promise<Boolean>`.

For example, you can look at the GraphQL operation's name in `requestContext.operationName` or at the HTTP headers in `requestContext.request.http?.headers`.

(If you don't want any usage reporting for any request, don't use this plugin; if you are using other plugins that require you to configure an Apollo API key, use `ApolloServerPluginUsageReportingDisabled` to prevent this plugin from being installed by default.)


</td>
</tr>

<tr>
<td>

###### `generateClientInfo`

`Function`
</td>
<td>

By default, this plugin associates client information such as name and version with user requests based on HTTP headers starting with `apollographql-client-`. If you have another way of communicating client information to your server, tell the plugin how it works with this option. This option has type `(GraphQLRequestContext) => { clientName?: string, clientVersion?: string, clientReferenceId?: string }`.
</td>
</tr>

<tr>
<td>

###### `overrideReportedSchema`

`string`
</td>
<td>

If you are using the `overrideReportedSchema` option to the [schema reporting plugin (`ApolloServerPluginSchemaReporting`)](./schema-reporting/#overridereportedschema), you should pass the same value here as well, so that the schema ID associated with requests in this plugin's usage reports matches the schema ID that the other plugin reports.

</td>
</tr>

<tr>
<td colspan="2">

**Configure the mechanics of communicating with Apollo's servers**
</td>
</tr>

<tr>
<td>

###### `sendReportsImmediately`

`boolean`
</td>
<td>

Sends a usage report after every request. This options is useful for stateless environments like Amazon Lambda where processes handle only a small number of requests before terminating. It defaults to true when used with an ApolloServer subclass for a serverless framework (Amazon Lambda, Google Cloud Functions, or Azure Functions), or false otherwise. (Note that "immediately" does not mean synchronously with completing the response, but "very soon", such as after a setImmediate call.)
</td>
</tr>

<tr>
<td>

###### `requestAgent`

`RequestAgent | false`
</td>
<td>

Node HTTP(s) agent to be used on the `fetch` call when sending reports to Apollo.
</td>
</tr>

<tr>
<td>

###### `reportIntervalMs`

`number`
</td>
<td>

How often to send reports to Apollo. We'll also send reports when the report gets big; see `maxUncompressedReportSize`.
</td>
</tr>

<tr>
<td>

###### `maxUncompressedReportSize`

`number`
</td>
<td>

We send a report when the report size will become bigger than this size in bytes (default: 4MB).  (This is a rough limit --- we ignore the size of the report header and some other top level bytes. We just add up the lengths of the serialized traces and signatures.)
</td>
</tr>

<tr>
<td>

###### `maxAttempts`

`number`
</td>
<td>

Reporting is retried with exponential backoff up to this many times (including the original request). Defaults to 5.
</td>
</tr>

<tr>
<td>

###### `minimumRetryDelayMs`

`number`
</td>
<td>

Minimum back-off for retries. Defaults to 100ms.
</td>
</tr>

<tr>
<td>

###### `logger`

`Logger`
</td>
<td>

A logger interface to be used for output and errors.  When not provided it will default to the server's own `logger` implementation and use `console` when that is not available.
</td>
</tr>

<tr>
<td>

###### `reportErrorFunction`

`Function`
</td>
<td>

By default, if an error occurs when sending trace reports to Apollo servers, its message will be sent to the `error` method on the logger specified with the `logger` option to this plugin or to ApolloServer (or to `console.error` by default). Specify this function to process errors in a different way. (The difference between using this option and using a logger is that this option receives the actual `Error` object whereas `logger.error` only receives its message.)
</td>
</tr>

<tr>
<td colspan="2">

**Internal and non-recommended options**
</td>
</tr>

<tr>
<td>

###### `endpointUrl`

`string`
</td>
<td>

The URL base that we send reports to (not including the path). This option only needs to be set for testing and Apollo-internal uses.
</td>
</tr>

<tr>
<td>

###### `debugPrintReports`

`boolean`
</td>
<td>

If set, prints all reports as JSON when they are sent. (Note that this feature is not as useful as it may sound because for technical reasons it currently does not include the actual traces.)
</td>
</tr>

<tr>
<td>

###### `calculateSignature`

`Function`
</td>
<td>

Specify the function for creating a signature for a query. This option is not recommended, as Apollo's servers make assumptions about how the signature relates to the operation you executed.
</td>
</tr>

<tr>
<td>

###### `sendOperationDocumentsOnUnexecutableOperation`

`Boolean`
</td>
<td>

Whether to include the entire document in the trace if the operation was a GraphQL parse or validation error (i.e. failed the GraphQL parse or validation phases). This will be included as a separate field on the trace and the operation name and signature will always be reported with a cosntant identifier. Whether the operation was a parse failure or a validation failure will be embedded within the stats report key itself.
</td>
</tr>

</tbody>
</table>
