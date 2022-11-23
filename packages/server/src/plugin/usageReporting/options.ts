import type { GraphQLError, DocumentNode } from 'graphql';
import type {
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContext,
  GraphQLRequestContextWillSendResponse,
  BaseContext,
} from '../../externalTypes/index.js';
import type { Logger } from '@apollo/utils.logger';
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type { Fetcher } from '@apollo/utils.fetcher';

export interface ApolloServerPluginUsageReportingOptions<
  TContext extends BaseContext,
> {
  //#region Configure exactly which data should be sent to Apollo.
  /**
   * Apollo Server's usage reports describe each individual request in one of
   * two ways: as a "trace" (a detailed description of the specific request,
   * including a query plan and resolver tree with timings and errors, as well
   * as optional details like variable values and HTTP headers), or as part of
   * aggregated "stats" (where invocations of the same operation from the same
   * client program are aggregated together rather than described individually).
   * Apollo Server uses an heuristic to decide which operations to describe as
   * traces and which to aggregate as stats.
   *
   * By setting the `sendTraces` option to `false`, Apollo Server will describe
   * *all* operations as stats; individual requests will never be broken out
   * into separate traces. If you set `sendTraces: false`, then Apollo Studio's
   * Traces view won't show any traces (other Studio functionality will be
   * unaffected).
   *
   * Note that the values of `sendVariableValues`, `sendHeaders`, and
   *  `sendUnexecutableOperationDocuments` are irrelevant if you set
   *  `sendTraces: false`, because those options control data that is contained
   *  only in traces (not in stats).
   *
   * Setting `sendTraces: false` does *NOT* imply `fieldLevelInstrumentation:
   * 0`. Apollo Server can still take advantage of field-level instrumentation
   * (either directly for monolith servers, or via federated tracing for
   * Gateways) in order to accurately report field execution usage in "stats".
   * This option only controls whether data is sent to Apollo's servers as
   * traces, not whether traces are internally used to learn about usage.
   */
  sendTraces?: boolean;

  /**
   * By default, Apollo Server does not send the values of any GraphQL variables
   * to Apollo's servers, because variable values often contain the private data
   * of your app's users. If you'd like variable values to be included in
   * traces, set this option. This option can take several forms:
   * - { none: true }: don't send any variable values (DEFAULT)
   * - { all: true}: send all variable values
   * - { transform: ... }: a custom function for modifying variable values. The
   *    function receives `variables` and `operationString` and should return a
   *    record of `variables` with the same keys as the `variables` it receives
   *    (added variables will be ignored and removed variables will be reported
   *    with an empty value). For security reasons, if an error occurs within
   *    this function, all variable values will be replaced with
   *    `[PREDICATE_FUNCTION_ERROR]`.
   * - { exceptNames: ... }: a case-sensitive list of names of variables whose
   *   values should not be sent to Apollo servers
   * - { onlyNames: ... }: A case-sensitive list of names of variables whose
   *   values will be sent to Apollo servers
   *
   * Defaults to not sending any variable values if both this parameter and the
   * deprecated `privateVariables` are not set. The report will indicate each
   * private variable key whose value was redacted by { none: true } or {
   * exceptNames: [...] }.
   *
   * The value of this option is not relevant if you set `sendTraces: false`,
   * because variable values only appear in traces.
   */
  sendVariableValues?: VariableValueOptions;
  /**
   * By default, Apollo Server does not send the HTTP request headers and values
   * to Apollo's servers, as these headers may contain your users' private data.
   * If you'd like this information included in traces, set this option. This
   * option can take several forms:
   *
   * - { none: true } to drop all HTTP request headers (DEFAULT)
   * - { all: true } to send the values of all HTTP request headers
   * - { exceptNames: Array<String> } A case-insensitive list of names of HTTP
   *     headers whose values should not be sent to Apollo servers
   * - { onlyNames: Array<String> }: A case-insensitive list of names of HTTP
   *   headers whose values will be sent to Apollo servers
   *
   * Unlike with sendVariableValues, names of dropped headers are not reported.
   * The headers 'authorization', 'cookie', and 'set-cookie' are never reported.
   *
   * The value of this option is not relevant if you set `sendTraces: false`,
   * because request headers only appear in traces.
   */
  sendHeaders?: SendValuesBaseOptions;
  /**
   * By default, if a trace contains errors, the errors are reported to Apollo
   * servers with the message `<masked>`. The errors are associated with
   * specific paths in the operation, but do not include the original error
   * message or any extensions such as the error `code`, as those details may
   * contain your users' private data. The extension `maskedBy:
   * 'ApolloServerPluginUsageReporting'` is added.
   *
   * If you'd like details about the error included in traces, set this option.
   * This option can take several forms:
   *
   * - { masked: true }: mask error messages and omit extensions (DEFAULT)
   * - { unmodified: true }: send all error messages and extensions to Apollo
   *   servers
   * - { transform: ... }: a custom function for transforming errors. This
   *   function receives a `GraphQLError` and may return a `GraphQLError`
   *   (either a new error, or its potentially-modified argument) or `null`.
   *   This error is used in the report to Apollo servers; if `null`, the error
   *   is not included in traces or error statistics.
   *
   * If you set `sendTraces: false`, then the only relevant aspect of this
   * option is whether you return `null` from a `transform` function or not
   * (which affects aggregated error statistics).
   */
  sendErrors?: SendErrorsOptions;

  /**
   * This option allows you to choose if Apollo Server should calculate detailed
   * per-field statistics for a particular request. It is only called for
   * executable operations: operations which parse and validate properly and
   * which do not have an unknown operation name. It is not called if an
   * `includeRequest` hook is provided and returns false.
   *
   * You can either pass an async function or a number. The function receives a
   * `GraphQLRequestContext`. (The effect of passing a number is described
   * later.) Your function can return a boolean or a number; returning false is
   * equivalent to returning 0 and returning true is equivalent to returning 1.
   *
   * Returning false (or 0) means that Apollo Server will only pay attention to
   * overall properties of the operation, like what GraphQL operation is
   * executing and how long the entire operation takes to execute, and not
   * anything about field-by-field execution.
   *
   * If you return false (or 0), this operation *will* still contribute to most
   * features of Studio, such as schema checks, the Operations page, and the
   * "referencing operations" statistic on the Fields page, etc.
   *
   * If you return false (or 0), this operation will *not* contribute to the
   * "field executions" statistic on the Fields page or to the execution timing
   * hints optionally displayed in Studio Explorer or in vscode-graphql.
   * Additionally, this operation will not produce a trace that can be viewed on
   * the Traces section of the Operations page.
   *
   * Returning false (or 0) for some or all operations can improve your server's
   * performance, as the overhead of calculating complete traces is not always
   * negligible. This is especially the case if this server is an Apollo
   * Gateway, as captured traces are transmitted from the subgraph to the
   * Gateway in-band inside the actual GraphQL response.
   *
   * Returning a positive number means that Apollo Server will track each field
   * execution and send Apollo Studio statistics on how many times each field
   * was executed and what the per-field performance was. Apollo Server sends
   * both a precise observed execution count and an estimated execution count.
   * The former is calculated by counting each field execution as 1, and the
   * latter is calculated by counting each field execution as the number
   * returned from this hook, which can be thought of as a weight.
   *
   * Passing a number `x` (which should be between 0 and 1 inclusive) for
   * `fieldLevelInstrumentation` is equivalent to passing the function `async ()
   * => Math.random() < x ? 1/x : 0`.  For example, if you pass 0.01, then 99%
   * of the time this function will return 0, and 1% of the time this function
   * will return 100. So 99% of the time Apollo Server will not track field
   * executions, and 1% of the time Apollo Server will track field executions
   * and send them to Apollo Studio both as an exact observed count and as an
   * "estimated" count which is 100 times higher.  Generally, the weights you
   * return should be roughly the reciprocal of the probability that the
   * function returns non-zero; however, you're welcome to craft a more
   * sophisticated function, such as one that uses a higher probability for
   * rarer operations and a lower probability for more common operations.
   *
   * (Note that returning true here does *not* mean that the data derived from
   * field-level instrumentation must be transmitted to Apollo Studio's servers
   * in the form of a trace; it may still be aggregated locally to statistics.
   * Similarly, setting `sendTraces: false` does not affect
   * `fieldLevelInstrumentation`. But either way this operation will contribute
   * to the "field executions" statistic and timing hints.)
   *
   * The default `fieldLevelInstrumentation` is a function that always returns
   * true.
   */
  fieldLevelInstrumentation?:
    | number
    | ((
        request: GraphQLRequestContextDidResolveOperation<TContext>,
      ) => Promise<number | boolean>);

  /**
   * This option allows you to choose if a particular request should be
   * represented in the usage reporting sent to Apollo servers. By default, all
   * requests are included. If this async predicate function is specified, its
   * return value will determine whether a given request is included.
   *
   * Note that returning false here means that the operation will be completely
   * ignored by all Apollo Studio features. If you merely want to improve
   * performance by skipping the field-level execution trace, set the
   * `fieldLevelInstrumentation` option instead of this one.
   *
   * The predicate function receives the request context. If validation and
   * parsing of the request succeeds, the function will receive the request
   * context in the
   * [`GraphQLRequestContextDidResolveOperation`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didresolveoperation)
   * phase, which permits tracing based on dynamic properties, e.g., HTTP
   * headers or the `operationName` (when available). Otherwise it will receive
   * the request context in the
   * [`GraphQLRequestContextWillSendResponse`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#willsendresponse)
   * phase:
   *
   * (If you don't want any usage reporting at all, don't use this option:
   * instead, either avoid specifying an Apollo API key, or use
   * ApolloServerPluginUsageReportingDisabled to prevent this plugin from being
   * created by default.)
   *
   * **Example:**
   *
   * ```js
   * includeRequest(requestContext) {
   *   // Always include `query HomeQuery { ... }`.
   *   if (requestContext.operationName === "HomeQuery") return true;
   *
   *   // Omit if the "report-to-apollo" header is set to "false".
   *   if (requestContext.request.http?.headers?.get("report-to-apollo") === "false") {
   *     return false;
   *   }
   *
   *   // Otherwise include.
   *   return true;
   * },
   * ```
   *
   */
  includeRequest?: (
    request:
      | GraphQLRequestContextDidResolveOperation<TContext>
      | GraphQLRequestContextWillSendResponse<TContext>,
  ) => Promise<boolean>;
  /**
   * By default, this plugin associates client information such as name
   * and version with user requests based on HTTP headers starting with
   * `apollographql-client-`. If you have another way of communicating
   * client information to your server, tell the plugin how it works
   * with this option.
   */
  generateClientInfo?: GenerateClientInfo<TContext>;
  /**
   * If you are using the `overrideReportedSchema` option to the schema
   * reporting plugin (`ApolloServerPluginSchemaReporting`), you should
   * pass the same value here as well, so that the schema ID associated
   * with requests in this plugin's usage reports matches the schema
   * ID that the other plugin reports.
   */
  overrideReportedSchema?: string;
  /**
   * Whether to include the entire document in the trace if the operation
   * was a GraphQL parse or validation error (i.e. failed the GraphQL parse or
   * validation phases). This will be included as a separate field on the trace
   * and the operation name and signature will always be reported with a constant
   * identifier. Whether the operation was a parse failure or a validation
   * failure will be embedded within the stats report key itself.
   *
   * The value of this option is not relevant if you set `sendTraces: false`,
   * because unexecutable operation documents only appear in traces.
   */
  sendUnexecutableOperationDocuments?: boolean;

  /**
   * This plugin sends information about operations to Apollo's servers in two
   * forms: as detailed operation traces of single operations and as summarized
   * statistics of many operations. Each individual operation is described in
   * exactly one of those ways. This hook lets you select which operations are
   * sent as traces and which are sent as statistics. The default is a heuristic
   * that tries to send one trace for each rough duration bucket for each
   * operation each minute, plus more if the operations have errors. (Note that
   * Apollo's servers perform their own sampling on received traces; not all
   * traces sent to Apollo's servers can be later retrieved via the trace UI.)
   *
   * If you just want to send all operations as stats, set `sendTraces: false`
   * instead of using this experimental hook.
   *
   * This option is highly experimental and may change or be removed in future
   * versions.
   */
  experimental_sendOperationAsTrace?: (
    trace: Trace,
    statsReportKey: string,
  ) => boolean;
  //#endregion

  //#region Configure the mechanics of communicating with Apollo's servers.
  /**
   * Sends a usage report after every request. This options is useful for
   * stateless environments like Amazon Lambda where processes handle only a
   * small number of requests before terminating. It defaults to true when the
   * ApolloServer was started in the background with
   * `startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests`
   * (generally used with serverless frameworks), or false otherwise. (Note that
   * "immediately" does not mean synchronously with completing the response, but
   * "very soon", such as after a setImmediate call.)
   */
  sendReportsImmediately?: boolean;
  /**
   * Specifies which Fetch API implementation to use when sending usage reports.
   */
  fetcher?: Fetcher;
  /**
   * How often to send reports to Apollo. We'll also send reports when the
   * report gets big; see maxUncompressedReportSize.
   */
  reportIntervalMs?: number;
  /**
   * We send a report when the report size will become bigger than this size in
   * bytes (default: 4MB).  (This is a rough limit --- we ignore the size of the
   * report header and some other top level bytes. We just add up the lengths of
   * the serialized traces and signatures.)
   */
  maxUncompressedReportSize?: number;
  /**
   * Reporting is retried with exponential backoff up to this many times
   * (including the original request). Defaults to 5.
   */
  maxAttempts?: number;
  /**
   * Minimum back-off for retries. Defaults to 100ms.
   */
  minimumRetryDelayMs?: number;
  /**
   * Timeout for each individual attempt to send a report to Apollo. (This is
   * for each HTTP POST, not for all potential retries.) Defaults to 30 seconds
   * (30000ms).
   */
  requestTimeoutMs?: number;
  /**
   * A logger interface to be used for output and errors.  When not provided
   * it will default to the server's own `logger` implementation and use
   * `console` when that is not available.
   */
  logger?: Logger;
  /**
   * By default, if an error occurs when sending trace reports to Apollo
   * servers, its message will be sent to the `error` method on the logger
   * specified with the `logger` option to this plugin or to ApolloServer (or to
   * `console.error` by default). Specify this function to process errors in a
   * different way. (The difference between using this option and using a logger
   * is that this option receives the actual Error object whereas `logger.error`
   * only receives its message.)
   */
  reportErrorFunction?: (err: Error) => void;
  //#endregion

  //#region Internal and non-recommended options
  /**
   * The URL base that we send reports to (not including the path). This option
   * only needs to be set for testing and Apollo-internal uses.
   */
  endpointUrl?: string;
  /**
   * If set, prints all reports as JSON when they are sent. (Note that for
   * technical reasons, traces embedded in a report are printed separately when
   * they are added to a report.) Reports are sent through `logger.info`.
   */
  debugPrintReports?: boolean;
  /**
   * Specify the function for creating a signature for a query. See signature.ts
   * for details. This option is not recommended, as Apollo's servers make assumptions
   * about how the signature relates to the operation you executed.
   */
  calculateSignature?: (ast: DocumentNode, operationName: string) => string;
  /**
   * This option is for internal use by `@apollo/server` only.
   *
   * By default we want to enable this plugin for non-subgraph schemas only, but
   * we need to come up with our list of plugins before we have necessarily
   * loaded the schema. So (unless the user installs this plugin or
   * ApolloServerPluginUsageReportingDisabled themselves), `@apollo/server`
   * always installs this plugin (if API key and graph ref are provided) and
   * uses this option to disable usage reporting if the schema is a subgraph.
   */
  __onlyIfSchemaIsNotSubgraph?: boolean;
  //#endregion
}

export type SendValuesBaseOptions =
  | { onlyNames: Array<string> }
  | { exceptNames: Array<string> }
  | { all: true }
  | { none: true };

type VariableValueTransformOptions = {
  variables: Record<string, any>;
  operationString?: string;
};

export type VariableValueOptions =
  | {
      transform: (
        options: VariableValueTransformOptions,
      ) => Record<string, any>;
    }
  | SendValuesBaseOptions;

export type SendErrorsOptions =
  | { unmodified: true }
  | { masked: true }
  | { transform: (err: GraphQLError) => GraphQLError | null };

export interface ClientInfo {
  clientName?: string;
  clientVersion?: string;
}
export type GenerateClientInfo<TContext extends BaseContext> = (
  requestContext: GraphQLRequestContext<TContext>,
) => ClientInfo;
