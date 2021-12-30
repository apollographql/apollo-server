import type { GraphQLError, DocumentNode } from 'graphql';
import type {
  GraphQLRequestContextDidResolveOperation,
  Logger,
  GraphQLRequestContext,
  GraphQLRequestContextWillSendResponse,
} from 'apollo-server-types';
import type { fetch, RequestAgent } from 'apollo-server-env';
import type { Trace } from 'apollo-reporting-protobuf';

export interface ApolloServerPluginUsageReportingOptions<TContext> {
  //#region Configure exactly which data should be sent to Apollo.
  /**
   * By default, Apollo Server does not send the values of any GraphQL variables to Apollo's servers, because variable
   * values often contain the private data of your app's users. If you'd like variable values to be included in traces, set this option.
   * This option can take several forms:
   * - { none: true }: don't send any variable values (DEFAULT)
   * - { all: true}: send all variable values
   * - { transform: ... }: a custom function for modifying variable values. Keys added by the custom function will
   *    be removed, and keys removed will be added back with an empty value. For security reasons, if an error occurs within this function, all variable values will be replaced with `[PREDICATE_FUNCTION_ERROR]`.
   * - { exceptNames: ... }: a case-sensitive list of names of variables whose values should not be sent to Apollo servers
   * - { onlyNames: ... }: A case-sensitive list of names of variables whose values will be sent to Apollo servers
   *
   * Defaults to not sending any variable values if both this parameter and
   * the deprecated `privateVariables` are not set. The report will
   * indicate each private variable key whose value was redacted by { none: true } or { exceptNames: [...] }.
   */
  sendVariableValues?: VariableValueOptions;
  /**
   * By default, Apollo Server does not send the list of HTTP headers and values
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
   */
  sendHeaders?: SendValuesBaseOptions;
  /**
   * By default, all errors get reported to Apollo servers. You can specify
   * a filter function to exclude specific errors from being reported by
   * returning an explicit `null`, or you can mask certain details of the error
   * by modifying it and returning the modified error.
   */
  rewriteError?: (err: GraphQLError) => GraphQLError | null;

  // We should strongly consider changing the default to false in AS4.

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
   * But either way this operation will contribute to the "field executions"
   * statistic and timing hints.)
   *
   * The default `fieldLevelInstrumentation` is a function that always returns
   * true.
   */
  fieldLevelInstrumentation?:
    | number
    | ((
        request: GraphQLRequestContextDidResolveOperation<TContext>,
      ) => Promise<boolean>);

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
   * and the operation name and signature will always be reported with a cosntant
   * identifier. Whether the operation was a parse failure or a validation
   * failure will be embedded within the stats report key itself.
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
   * small number of requests before terminating. It defaults to true when
   * used with an ApolloServer subclass for a serverless framework (Amazon
   * Lambda, Google Cloud Functions, or Azure Functions), or false otherwise.
   * (Note that "immediately" does not mean synchronously with completing the
   * response, but "very soon", such as after a setImmediate call.)
   */
  sendReportsImmediately?: boolean;
  /**
   * HTTP(s) agent to be used on the `fetch` call when sending reports to
   * Apollo.
   */
  requestAgent?: RequestAgent | false;
  /**
   * Specifies which Fetch API implementation to use when sending usage reports.
   */
  fetcher?: typeof fetch;
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
   * they are added to a report.)
   */
  debugPrintReports?: boolean;
  /**
   * Specify the function for creating a signature for a query. See signature.ts
   * for details. This option is not recommended, as Apollo's servers make assumptions
   * about how the signature relates to the operation you executed.
   */
  calculateSignature?: (ast: DocumentNode, operationName: string) => string;
  /**
   * This option includes extra data in reports that helps Apollo validate the
   * stats generation code in this plugin. Do not set it; the only impact on
   * your app will be a decrease in performance.
   */
  internal_includeTracesContributingToStats?: boolean;
  //#endregion
}

export type SendValuesBaseOptions =
  | { onlyNames: Array<String> }
  | { exceptNames: Array<String> }
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

export interface ClientInfo {
  clientName?: string;
  clientVersion?: string;
}
export type GenerateClientInfo<TContext> = (
  requestContext: GraphQLRequestContext<TContext>,
) => ClientInfo;
