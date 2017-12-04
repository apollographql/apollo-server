/*
 * Mostly taken straight from express-graphql, so see their licence
 * (https://github.com/graphql/express-graphql/blob/master/LICENSE)
 */

// TODO: in the future, build the GraphiQL app on the server, so it does not
// depend on any CDN and can be run offline.

/*
 * Arguments:
 *
 * - endpointURL: the relative or absolute URL for the endpoint which GraphiQL will make queries to
 * - (optional) query: the GraphQL query to pre-fill in the GraphiQL UI
 * - (optional) variables: a JS object of variables to pre-fill in the GraphiQL UI
 * - (optional) operationName: the operationName to pre-fill in the GraphiQL UI
 * - (optional) result: the result of the query to pre-fill in the GraphiQL UI
 * - (optional) passHeader: a string that will be added to the header object.
 * For example "'Authorization': localStorage['Meteor.loginToken']" for meteor
 * - (optional) editorTheme: a CodeMirror theme to be applied to the GraphiQL UI
 * - (optional) websocketConnectionParams: an object to pass to the web socket server
 */

export type GraphiQLData = {
  endpointURL: string,
  subscriptionsEndpoint?: string,
  query?: string,
  variables?: Object,
  operationName?: string,
  result?: Object,
  passHeader?: string,
  editorTheme?: string,
  websocketConnectionParams?: Object,
};

// Current latest version of GraphiQL.
const GRAPHIQL_VERSION = '0.11.2';
const SUBSCRIPTIONS_TRANSPORT_VERSION = '0.8.2';

// Ensures string values are safe to be used within a <script> tag.
// TODO: I don't think that's the right escape function
function safeSerialize(data) {
  return data ? JSON.stringify(data).replace(/\//g, '\\/') : null;
}

export function renderGraphiQL(data: GraphiQLData): string {
  const endpointURL = data.endpointURL;
  const endpointWs = endpointURL.startsWith('ws://') || endpointURL.startsWith('wss://');
  const subscriptionsEndpoint = data.subscriptionsEndpoint;
  const usingHttp = !endpointWs;
  const usingWs = endpointWs || !!subscriptionsEndpoint;
  const endpointURLWs = usingWs && (endpointWs ? endpointURL : subscriptionsEndpoint);

  const queryString = data.query;
  const variablesString =
    data.variables ? JSON.stringify(data.variables, null, 2) : null;
  const resultString = null;
  const operationName = data.operationName;
  const passHeader = data.passHeader ? data.passHeader : '';
  const editorTheme = data.editorTheme;
  const usingEditorTheme = !!editorTheme;
  const websocketConnectionParams = data.websocketConnectionParams || null;

  /* eslint-disable max-len */
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GraphiQL</title>
  <meta name="robots" content="noindex" />
  <style>
    html, body {
      height: 100%;
      margin: 0;
      overflow: hidden;
      width: 100%;
    }
  </style>
  <link href="//unpkg.com/graphiql@${GRAPHIQL_VERSION}/graphiql.css" rel="stylesheet" />
  <script src="//unpkg.com/react@15.6.1/dist/react.min.js"></script>
  <script src="//unpkg.com/react-dom@15.6.1/dist/react-dom.min.js"></script>
  <script src="//unpkg.com/graphiql@${GRAPHIQL_VERSION}/graphiql.min.js"></script>
  ${usingEditorTheme ?
    `<link href="//cdn.jsdelivr.net/npm/codemirror@5/theme/${editorTheme}.min.css" rel="stylesheet" />`
    : ''}
  ${usingHttp ?
    `<script src="//cdn.jsdelivr.net/fetch/2.0.1/fetch.min.js"></script>`
    : ''}
  ${usingWs ?
    `<script src="//unpkg.com/subscriptions-transport-ws@${SUBSCRIPTIONS_TRANSPORT_VERSION}/browser/client.js"></script>`
    : ''}
  ${usingWs && usingHttp ?
    '<script src="//unpkg.com/graphiql-subscriptions-fetcher@0.0.2/browser/client.js"></script>'
    : ''}

</head>
<body>
  <script>
    // Collect the URL parameters
    var parameters = {};
    window.location.search.substr(1).split('&').forEach(function (entry) {
      var eq = entry.indexOf('=');
      if (eq >= 0) {
        parameters[decodeURIComponent(entry.slice(0, eq))] =
          decodeURIComponent(entry.slice(eq + 1));
      }
    });
    // Produce a Location query string from a parameter object.
    function locationQuery(params, location) {
      return (location ? location: '') + '?' + Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(params[key]);
      }).join('&');
    }
    // Derive a fetch URL from the current URL, sans the GraphQL parameters.
    var graphqlParamNames = {
      query: true,
      variables: true,
      operationName: true
    };
    var otherParams = {};
    for (var k in parameters) {
      if (parameters.hasOwnProperty(k) && graphqlParamNames[k] !== true) {
        otherParams[k] = parameters[k];
      }
    }

    ${usingWs ? `
    var subscriptionsClient = new window.SubscriptionsTransportWs.SubscriptionClient('${endpointURLWs}', {
      reconnect: true${websocketConnectionParams ? `,
      connectionParams: ${JSON.stringify(websocketConnectionParams)}` : '' }
    });

    var graphQLWSFetcher = subscriptionsClient.request.bind(subscriptionsClient);
    ` : ''}

    ${usingHttp ? `
      // We don't use safe-serialize for location, because it's not client input.
      var fetchURL = locationQuery(otherParams, '${endpointURL}');

      // Defines a GraphQL fetcher using the fetch API.
      function graphQLHttpFetcher(graphQLParams) {
          return fetch(fetchURL, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              ${passHeader}
            },
            body: JSON.stringify(graphQLParams),
            credentials: 'same-origin',
          }).then(function (response) {
            return response.text();
          }).then(function (responseBody) {
            try {
              return JSON.parse(responseBody);
            } catch (error) {
              return responseBody;
            }
          });
      }
    ` : ''}

    ${usingWs && usingHttp ? `
      var fetcher =
        window.GraphiQLSubscriptionsFetcher.graphQLFetcher(subscriptionsClient, graphQLHttpFetcher);
    ` : `
      var fetcher = ${usingWs ? 'graphQLWSFetcher' : 'graphQLHttpFetcher' };
    `}

    // When the query and variables string is edited, update the URL bar so
    // that it can be easily shared.
    function onEditQuery(newQuery) {
      parameters.query = newQuery;
      updateURL();
    }
    function onEditVariables(newVariables) {
      parameters.variables = newVariables;
      updateURL();
    }
    function onEditOperationName(newOperationName) {
      parameters.operationName = newOperationName;
      updateURL();
    }
    function updateURL() {
      var cleanParams = Object.keys(parameters).filter(function(v) {
        return parameters[v];
      }).reduce(function(old, v) {
        old[v] = parameters[v];
        return old;
      }, {});

      history.replaceState(null, null, locationQuery(cleanParams) + window.location.hash);
    }
    // Render <GraphiQL /> into the body.
    ReactDOM.render(
      React.createElement(GraphiQL, {
        fetcher: fetcher,
        onEditQuery: onEditQuery,
        onEditVariables: onEditVariables,
        onEditOperationName: onEditOperationName,
        query: ${safeSerialize(queryString)},
        response: ${safeSerialize(resultString)},
        variables: ${safeSerialize(variablesString)},
        operationName: ${safeSerialize(operationName)},
        editorTheme: ${safeSerialize(editorTheme)},
        websocketConnectionParams: ${safeSerialize(websocketConnectionParams)},
      }),
      document.body
    );
  </script>
</body>
</html>`;
}
