---
title: "API Reference: Usage reporting plugin"
api_reference: true
---

Apollo Server's built-in usage reporting plugin gathers data on how your clients use the operations and fields in your GraphQL schema. The plugin also handles pushing this usage data to [Apollo Studio](https://www.apollographql.com/docs/studio/), as described in [Metrics and logging](../../monitoring/metrics/).

## Default installation

Apollo Server automatically installs and enables this plugin with default settings if you [provide a graph API key and a graph ref to Apollo Server](../../monitoring/metrics/#connecting-to-apollo-studio). You usually do this by setting the `APOLLO_KEY` and `APOLLO_GRAPH_REF` (or `APOLLO_GRAPH_ID` and `APOLLO_GRAPH_VARIANT`) environment variables. No other action is required.

If you don't provide an API key and graph ref, this plugin is not installed.

If you provide an API key but _don't_ provide a graph ref, a warning is logged. You can [disable the plugin](#disabling-the-plugin) to hide the warning.

## Custom installation

You can configure the usage reporting plugin's behavior by including it in the `plugins` array you pass to the `ApolloServer` constructor:

```js
import { ApolloServer } from "apollo-server";
import {
  ApolloServerPluginUsageReporting,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  plugins: [
    ApolloServerPluginUsageReporting({
      fieldLevelInstrumentation: 0.5,
    }),
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});
```

Supported configuration options are listed below.

#### Options

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

**Configuring which data is sent to Apollo Studio**
</td>
</tr>

<tr>
<td>

###### `sendVariableValues`

`Object`
</td>
<td>

Provide this object to configure which GraphQL variable values are included in trace data that's sent to Apollo Studio. Valid options are described in [Valid `sendVariableValues` object signatures](#valid-sendvariablevalues-object-signatures).

The default value is `{ none: true }`, which means **no** variable values are sent to Studio. This is a security measure to prevent sensitive data from potentially reaching Apollo servers.

</td>
</tr>

<tr>
<td>

###### `sendHeaders`

`Object`
</td>
<td>

Provide this object to configure which request header names and values are included in trace data that's sent to Apollo Studio. Valid options are described in [Valid `sendHeaders` object signatures](#valid-sendheaders-object-signatures).

The default value is `{ none: true }`, which means **no** header names or values are sent to Studio. This is a security measure to prevent sensitive data from potentially reaching Apollo servers.

</td>
</tr>

<tr>
<td>

###### `rewriteError`

`Function`
</td>
<td>

Specify this function to modify GraphQL operation errors before Apollo Server reports those errors to Apollo Studio. The function takes a [`GraphQLError`](https://github.com/graphql/graphql-js/blob/main/src/error/GraphQLError.ts) object and must also return one (or `null` to prevent Apollo Server from reporting a particular error entirely).

The only properties of the reported error you can modify are its `message` and its `extensions`.

**Note:** If this `ApolloServer` instance is acting as the gateway in an [Apollo Federation](https://www.apollographql.com/docs/federation/#architecture) architecture, this option does **not** modify errors that originate in subgraphs. To modify those errors, instead configure the [`rewriteError` option in the inline trace plugin](./inline-trace/#rewriteerror), which you install in the subgraph's `ApolloServer` instance.
</td>
</tr>

<tr>
<td>

###### `fieldLevelInstrumentation`

`async Function` or `number`
</td>
<td>

This option enables you to configure whether Apollo Server calculates detailed per-field statistics for each operation. It is used only for operations that reach execution without encountering an error (such as during parsing, validation, or resolving the operation name). It is _not_ used if you provide an [`includeRequest`](#includerequest) hook that returns `false`.

You can provide either a number or an an async function.

**If you provide a number**, that number must be between `0` and `1`, inclusive. This number specifies the probability that Apollo Server calculates per-field statistics for each incoming operation.

For example, if you pass `0.01`, then Apollo Server calculates statistics for approximately 1% of operations. When Apollo Server reports these statistics to Apollo Studio, it also provides an "estimation multiplier" of each field's actual number of executions (for example, with a probability of `0.01`, the estimation multiplier is `100`).

Providing a number `x` is equivalent to passing this function:

`async () => Math.random() < x ? 1/x : 0`

**If you pass a function**, the function is called once for each operation, and it's passed a corresponding `GraphQLRequestContext` object. The function can return either a boolean or a number. Returning `false` is equivalent to returning `0`, and returning `true` is equivalent to returning `1`.

**If the function returns `false` (or `0`):**

* Apollo Server _doesn't_ calculate per-field statistics for the associated operation.
* The operation _doesn't_ contribute to the "field executions" statistic on the Fields page in Studio, or to the execution timing hints displayed in the Explorer or in VS Code.
* The operation _doesn't_ produce a trace that can be viewed in the Traces section of the Operations page in Studio.
* The operation _does_ still contribute to most features of Studio, such as schema checks, the Operations page, and the "referencing operations" statistic on the Fields page.

(For more information about the difference between the "referencing operations" and "field executions" statistics, see [the Studio Fields page documentation](https://apollographql.com/docs/studio/metrics/field-usage/).)

Returning `false` (or `0`) for some or all operations can improve your server's performance, because calculating complete traces can introduce significant overhead. This is especially true for a federated graph, because traces are transmitted from the subgraph to the Gateway in-band inside the actual GraphQL response.

**If the function returns a positive number:**

* Apollo Server _does_ calculate per-field statistics for the associated operation, and it sends those statistics to Apollo Studio.
* Apollo Server sends Studio both an _observed_ execution count and an _estimated total_ execution count for each field.
* The _observed_ execution count is exactly how many times each field was resolved in the associated operation.
* The _estimated total_ execution count is the _observed_ execution count, _multiplied by the number returned by this function_. You can think of this returned number as an "estimation multiplier".

To determine the "estimation multiplier" that the function should return, take the reciprocal of the frequency with which the function returns a non-zero number for the associated operation.

For example, if the function returns a non-zero number one out of every ten times for a particular operation, then the number it returns should be `10`. Your function can use different logic for different operations, such as to more frequently report rare operations than common operations.

Note that returning `true` here does *not* mean that the data derived from field-level instrumentation must be transmitted to Apollo Studio's servers in the form of a trace. The data can still be aggregated locally to statistics. Either way, this operation contributes to the "field executions" statistic in Studio, along with timing hints.

The default value is a function that always returns `true`.

</td>
</tr>

<tr>
<td>

###### `includeRequest`

`async Function`
</td>
<td>

Specify this asynchronous function to configure which requests are included in usage reports sent to Apollo Studio. For example, you can omit requests that execute a particular operation or requests that include a particular HTTP header.

 Note that returning `false` here means that the operation is completely ignored by all Apollo Studio features. If you want to improve performance by skipping the field-level execution trace, set the [`fieldLevelInstrumentation`](#fieldlevelinstrumentation) option instead of this one.

This function is called for each received request. It takes a [`GraphQLRequestContext`](https://github.com/apollographql/apollo-server/blob/main/packages/apollo-server-types/src/index.ts#L115-L150) object and must return a `Promise<Boolean>` that indicates whether to include the request. It's called either after the operation is successfully resolved (via [the `didResolveOperation` event](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didresolveoperation)), or when sending the final error response if the operation was not successfully resolved (via [the `willSendResponse` event](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#willsendresponse)).

If you don't want any usage reporting at all, don't use this option: instead, either avoid specifying an Apollo API key or explicitly [disable the plugin](#disabling-the-plugin).

By default, all requests are included in usage reports.

</td>
</tr>

<tr>
<td>

###### `generateClientInfo`

`Function`
</td>
<td>

Specify this function to provide Apollo Studio with client details for each processed request. Apollo Studio uses this information to [segment metrics by client](https://www.apollographql.com/docs/studio/client-awareness/).

This function is passed a [`GraphQLRequestContext`](https://github.com/apollographql/apollo-server/blob/main/packages/apollo-server-types/src/index.ts#L115-L150) object containing all available information about the request. It should return an object with `clientName` and `clientVersion` fields that identify the associated client.

By default, the plugin attempts to obtain these values from the incoming request's HTTP headers (specifically, `apollographql-client-name` and `apollographql-client-version`).

</td>
</tr>

<tr>
<td>

###### `overrideReportedSchema`

`string`
</td>
<td>

If you're using the `overrideReportedSchema` option with the [schema reporting plugin (`ApolloServerPluginSchemaReporting`)](./schema-reporting/#overridereportedschema), you should provide the same value for this option. This ensures that the schema ID associated with a request in this plugin's usage reports matches the schema ID that the other plugin reports.

</td>
</tr>

<tr>
<td>

###### `sendUnexecutableOperationDocuments`

`Boolean`
</td>
<td>

Statistics about operations that your server cannot execute are not reported under each document separately to Apollo Studio, but are grouped together as "parse failure", "validation failure", or "unknown operation name". By default, the usage reporting plugin does not include the full operation document in reported traces, because it is challenging to strip potential private information (like string constants) from invalid operations. If you'd like the usage reporting plugin to send the full operation document and operation name so you can view it in Apollo Studio's trace view, set this to true.

</td>
</tr>

<tr>
<td colspan="2">

**Configuring communication protocol**
</td>
</tr>

<tr>
<td>

###### `sendReportsImmediately`

`boolean`
</td>
<td>

If `true`, the plugin sends a usage report to Apollo Studio after every request instead of sending batched reports.

This option is useful for stateless environments like Amazon Lambda where processes terminate after handling a small number of requests.

The default value is `true` when using an `ApolloServer` subclass for a serverless framework (Amazon Lambda, Google Cloud Functions, or Azure Functions) and `false` otherwise.

Note that "immediately" does not mean _synchronously_ with completing the response, but rather "very soon", such as after a `setImmediate` call.

</td>
</tr>

<tr>
<td>

###### `requestAgent`

`http.Agent` or `https.Agent` or `false`
</td>
<td>

An HTTP(S) agent to use for reporting. Can be either an [`http.Agent`](https://nodejs.org/docs/latest-v10.x/api/http.html#http_class_http_agent) or an [`https.Agent`](https://nodejs.org/docs/latest-v10.x/api/https.html#https_class_https_agent). It behaves the same as the `agent` parameter to [`http.request`](https://nodejs.org/docs/latest-v8.x/api/http.html#http_http_request_options_callback).
</td>
</tr>

<tr>
<td>

###### `fetcher`

`typeof fetch`
</td>
<td>

Specifies which [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) function implementation to use when sending usage reports.
</td>
</tr>

<tr>
<td>

###### `reportIntervalMs`

`number`
</td>
<td>

The interval at which Apollo Server should send batched trace reports to Studio, in milliseconds.

Regardless of this value, Apollo Server sends a trace report whenever the size of a pending batch exceeds the value of `maxUncompressedReportSize` (default 4MB).

</td>
</tr>

<tr>
<td>

###### `maxUncompressedReportSize`

`number`
</td>
<td>

Apollo Server sends a trace report whenever the size of a pending batched trace report exceeds this value (in bytes), regardless of its standard reporting interval.

Note that this is a rough limit that includes the size of serialized traces and signatures. It ignores the size of the report's header and some other top-level bytes.

The default value is 4MB (`4194304`).
</td>
</tr>

<tr>
<td>

###### `maxAttempts`

`number`
</td>
<td>

The maximum number of times Apollo Server should attempt to report each trace report, performing exponential backoff between attempts.

The default value is `5`.
</td>
</tr>

<tr>
<td>

###### `minimumRetryDelayMs`

`number`
</td>
<td>

The minimum amount of backoff (in milliseconds) Apollo Server should perform before retrying a failed trace report.

The default value is `100`.
</td>
</tr>

<tr>
<td>

###### `logger`

[`Logger`](https://www.npmjs.com/package/@apollo/utils.logger)
</td>
<td>

If you provide this object, the plugin sends it all log messages related to Apollo Studio communication, instead of sending them to the default logger. The object must implement all methods of [the `Logger` interface](https://www.npmjs.com/package/@apollo/utils.logger).

</td>
</tr>

<tr>
<td>

###### `reportErrorFunction`

`Function`
</td>
<td>

If you provide this function, the plugin calls it whenever it encounters an error while reporting usage data. The details of the error are passed to the function.

By default, the plugin logs these errors to its specified `logger`. _Unlike_ the `logger`, this function receives the actual `Error` object instead of only an error message.

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

The URL base that the plugin sends reports to (not including the path). This option only needs to be set for testing and Apollo-internal uses.
</td>
</tr>

<tr>
<td>

###### `debugPrintReports`

`boolean`
</td>
<td>

If set, prints all reports as JSON when they are sent. (Note that for technical reasons, traces embedded in a report are printed separately when they are added to a report.)
</td>
</tr>

<tr>
<td>

###### `calculateSignature`

`Function`
</td>
<td>

Specify this function to create a signature for a query. This option is not recommended, because Apollo's servers make assumptions about how the signature relates to the operation you executed.
</td>
</tr>

</tbody>
</table>

#### Valid `sendVariableValues` object signatures

| Object | Description |
|--------|-------------|
| `{ none: true }` | If you provide this object, no GraphQL variable values are sent to Apollo Studio. This is the default behavior. |
| `{ all: true }` |  If you provide this object, **all** GraphQL variable values are sent to Apollo Studio. |
| `{ onlyNames: ["apple", "orange"]}`| If you provide an object with this structure, only values of the GraphQL variables with names that appear in the array are sent to Apollo Studio. To filter individual fields of a variable that contains an input type, use the `transform` function below instead. Case-sensitive. |
| `{ exceptNames: ["apple", "orange"]}`| If you provide an object with this structure, all GraphQL variable values **except** values of the variables with names that appear in the array are sent to Apollo Studio. To filter individual fields of a variable that contains an input type, use the `transform` function below instead. Case-sensitive. |
| `{ transform: ({ variables, operationString)} => { ... } }` | <p>The value of `transform` is a function that takes the values of all GraphQL variables for an operation and the operation string. The function returns a new variables map containing values for the operation's variables that should be sent to Apollo Studio. This map does not need to contain all of the operation's variables, but it cannot _add_ variables to the map. You should not mutate `variables` itself or any of the values contained in it.</p><p>For security reasons, if an error occurs in the `transform` function, **all** variable values are replaced with `[PREDICATE_FUNCTION_ERROR]`. |

#### Valid `sendHeaders` object signatures

| Object | Description |
|--------|-------------|
| `{ none: true }` | If you provide this object, no request header names or values are sent to Apollo Studio. This is the default behavior. |
| `{ all: true }` |  If you provide this object, **all** GraphQL header names and values are sent to Apollo Studio, except for the protected headers listed below. |
| `{ onlyNames: ["apple", "orange"]}`| If you provide an object with this structure, only names and values of the request headers with names that appear in the array are sent to Apollo Studio. Case-insensitive. |
| `{ exceptNames: ["apple", "orange"]}`| If you provide an object with this structure, all GraphQL header values **except** values of headers with names that appear in the array are sent to Apollo Studio. Case-insensitive. |

**Note:** Regardless of your configuration, Apollo Server **never** sends the values of the following headers to Apollo Studio:

 * `authorization`
 * `cookie`
 * `set-cookie`

## Disabling the plugin

If you _don't_ want to install the usage reporting plugin and you _are_ providing an API key to Apollo Server for other purposes, you can disable usage reporting by installing the `ApolloServerPluginUsageReportingDisabled` plugin, like so:

```js
import { ApolloServer } from "apollo-server";
import {
  ApolloServerPluginUsageReportingDisabled,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  plugins: [
    ApolloServerPluginUsageReportingDisabled(),
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});
```

This also disables the warning log if you provide an API key but do not provide a graph ref.
