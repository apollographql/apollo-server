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
 */

export type GraphiQLData = {
  endpointURL: string,
  subscriptionsEndpoint?: string,
  query?: string,
  variables?: Object,
  operationName?: string,
  result?: Object,
  passHeader?: string,
};

// Current latest version of GraphiQL.
const GRAPHIQL_VERSION = '0.9.1';

// Ensures string values are safe to be used within a <script> tag.
// TODO: I don't think that's the right escape function
function safeSerialize(data) {
  return data ? JSON.stringify(data).replace(/\//g, '\\/') : null;
}

export function renderGraphiQL(data: GraphiQLData): string {
  const endpointURL = data.endpointURL;
  const subscriptionsEndpoint = data.subscriptionsEndpoint;
  const usingSubscriptions = !!subscriptionsEndpoint;
  const isWs = data.endpointURL.startsWith('ws://');
  const queryString = data.query;
  const variablesString =
    data.variables ? JSON.stringify(data.variables, null, 2) : null;
  const resultString = null;
  const operationName = data.operationName;
  const passHeader = data.passHeader ? data.passHeader : '';
  const fetchLibrary = isWs ?
      `<script src="//npmcdn.com/@reactivex/rxjs@5.0.0-beta.12/dist/global/Rx.min.js"></script>
       <script src="//npmcdn.com/rxjs-diff-operator@0.1.1/dist/main.browser.js"></script>` :
      `<script src="//cdn.jsdelivr.net/fetch/0.9.0/fetch.min.js"></script>`;
  const fetcher = isWs ? `
    Rx.Observable.prototype.fromDiff = rxjsDiffOperator.fromDiff;
    var reqId = 0;

    function graphQLFetcher(graphQLParams) {
      var localReqId = reqId++;
      return new Rx.Observable(function (observer) {
        var payload = JSON.stringify(Object.assign({}, graphQLParams, {
          action: "request",
          id: localReqId,
        }));
        var isOpen = false;

        var ws = new WebSocket(fetchURL);

        ws.onmessage = function (msg) {
          observer.next(msg.data);
        };
        ws.onerror = function(e) {
          observer.error(new Error("WebSocket error"));
        };
        ws.onclose = function () {
          observer.complete();
        };
        ws.onopen = function () {
          isOpen = true;
          ws.send(payload);
        };

        return function () {
          if ( isOpen == true ) {
            ws.send(JSON.stringify({ id: localReqId, action: "cancel" }));
          }
          ws.close();
        };
      })
      .map(JSON.parse)
      .filter(function (v) { return v.id == localReqId })
      .fromDiff()
      .catch((e) => {
        return Rx.Observable.of({ errors: [e.message] });
      });
    }
  ` : `
    function graphQLFetcher(graphQLParams) {
      return fetch(fetchURL, {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ${passHeader}
        },
        body: JSON.stringify(graphQLParams),
        credentials: 'include',
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
  `;

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
  <link href="//cdn.jsdelivr.net/graphiql/${GRAPHIQL_VERSION}/graphiql.css" rel="stylesheet" />
  ${fetchLibrary}
  <script src="//cdn.jsdelivr.net/react/15.0.0/react.min.js"></script>
  <script src="//cdn.jsdelivr.net/react/15.0.0/react-dom.min.js"></script>
  <script src="//cdn.jsdelivr.net/graphiql/${GRAPHIQL_VERSION}/graphiql.min.js"></script>
  ${usingSubscriptions ?
    '<script src="//unpkg.com/subscriptions-transport-ws@0.5.4/browser/client.js"></script>' +
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

    var fetcher;

    if (${usingSubscriptions}) {
      var subscriptionsClient = new window.SubscriptionsTransportWs.SubscriptionClient('${subscriptionsEndpoint}', {
        reconnect: true
      });
      fetcher = window.GraphiQLSubscriptionsFetcher.graphQLFetcher(subscriptionsClient, graphQLFetcher);
    } else {
      fetcher = graphQLFetcher;
    }

    // We don't use safe-serialize for location, because it's not client input.
    var fetchURL = locationQuery(otherParams, '${endpointURL}');

    // Defines a GraphQL fetcher using the fetch API.
    ${fetcher}
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
      history.replaceState(null, null, locationQuery(parameters));
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
      }),
      document.body
    );
  </script>
</body>
</html>`;
}
