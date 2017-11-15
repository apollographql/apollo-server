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
  endpointURL: string;
  subscriptionsEndpoint?: string;
  query?: string;
  variables?: Object;
  operationName?: string;
  result?: Object;
  passHeader?: string;
  editorTheme?: string;
  websocketConnectionParams?: Object;
};

export function renderGraphiQL(graphiqlPath: string, data: GraphiQLData): string {
  const {
    endpointURL,
    subscriptionsEndpoint,
    query,
    variables,
    result,
    passHeader,
    websocketConnectionParams,
    operationName
  } = data;

  const options = {
    endpointURL,
    subscriptionsEndpoint,
    httpHeaders: passHeader && JSON.parse(`{${passHeader}}`),
    websocketConnectionParams,
    query,
    result: result && JSON.stringify(result),
    variables,
    operationName
  };

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
    #main {
      width: 100vw;
      height: 100vh;
    }
  </style>
  <link rel="stylesheet" href="${graphiqlPath}/assets/styles.css">
</head>
<body>
<main id="main"></main>
<script>
  window.__APOLLO_GRAPHIQL_OPTIONS__ = ${JSON.stringify(options)};
</script>
<script src="${graphiqlPath}/assets/bundle.js"></script>
</body>
</html>
  `;
}
