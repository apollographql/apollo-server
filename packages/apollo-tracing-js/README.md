# Apollo Tracing (for Node.js)

This package is used to collect and expose trace data for GraphQL requests. 

It relies on instrumenting a GraphQL schema to collect resolver timings, and exposes trace data for an individual request under `extensions` as part of the GraphQL response.

The tracing format is work in progress, and we'd like to work with the rest of the GraphQL community to make it broadly useful, and to build awesome tools on top of it.

## Use in Apollo Optics

One use of Apollo Tracing is to add support for Apollo Optics to more GraphQL servers.

Currently, Apollo Optics relies on an agent running in your server that collects, aggregates, and batches up data to send to the Optics backend. Because agents contain fairly complicated logic, we've only been able to support Node.js and Ruby servers so far.

In the new architecture, trace data is included with the GraphQL response, and a separate proxy process (provided by Apollo) is responsible for filtering out the trace data and performing the aggregation and batching. This will make it much easier to use Optics with every GraphQL server, as long as it supports Apollo Tracing.

## Usage

### Apollo Server

Apollo Server will include built-in support for tracing in a future release. Until then, you can install a WIP version of tracing support with `npm install apollo-server-<variant>@tracing`.

The only code change required is to add `tracing: true` to the options passed to the Apollo Server middleware function for your framework of choice. For example, for Express:

```javascript
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {},
  tracing: true,
}));
```

### `express-graphql`

Using Apollo Tracing with `express-graphql` currently requires more manual configuration:

```javascript
import {
  TraceCollector,
  instrumentSchemaForTracing,
  formatTraceData
} from 'apollo-tracing'

...

app.use('/graphql', 
  (req, res, next) => {
    const traceCollector = new TraceCollector();
    traceCollector.requestDidStart();
    req._traceCollector = traceCollector;
    next(); 
  }, 
  graphqlHTTP(request => ({
    schema: instrumentSchemaForTracing(schema),
    context: {
      _traceCollector: request._traceCollector
    },
    graphiql: true,
    extensions: () => {
      const traceCollector = request._traceCollector;
      traceCollector.requestDidEnd();
      return {
        tracing: formatTraceData(traceCollector)
      }
    }
  }))
);
```