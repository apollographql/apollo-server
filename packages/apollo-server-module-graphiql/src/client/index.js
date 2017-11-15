import React from 'react';
import { render } from 'react-dom';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

import { createFetcher } from './createFetcher';

const {
  endpointURL,
  subscriptionsEndpoint,
  httpHeaders,
  websocketConnectionParams,
  query,
  result,
  variables,
  operationName
} =
  window.__APOLLO_GRAPHIQL_OPTIONS__ || {};

const fetcher = createFetcher({
  endpointURL,
  subscriptionsEndpoint,
  websocketConnectionParams,
  httpHeaders
});
const parameters = {};

window.location.search
  .substr(1)
  .split('&')
  .forEach(function(entry) {
    var eq = entry.indexOf('=');
    if (eq >= 0) {
      parameters[decodeURIComponent(entry.slice(0, eq))] = decodeURIComponent(entry.slice(eq + 1));
    }
  });

// Produce a Location query string from a parameter object.
function locationQuery(params, location) {
  return (
    (location ? location : '') +
    '?' +
    Object.keys(params)
      .map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      })
      .join('&')
  );
}

// Derive a fetch URL from the current URL, sans the GraphQL parameters.
const graphqlParamNames = {
  query: true,
  variables: true,
  operationName: true
};

const otherParams = {};
for (var k in parameters) {
  if (parameters.hasOwnProperty(k) && graphqlParamNames[k] !== true) {
    otherParams[k] = parameters[k];
  }
}

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
  const cleanParams = Object.keys(parameters)
    .filter(function(v) {
      return parameters[v] !== undefined;
    })
    .reduce(function(old, v) {
      old[v] = parameters[v];
      return old;
    }, {});

  history.replaceState(null, null, locationQuery(cleanParams) + window.location.hash);
}

render(
  <GraphiQL
    fetcher={fetcher}
    onEditQuery={onEditQuery}
    onEditVariables={onEditVariables}
    onEditOperationName={onEditOperationName}
    query={query}
    response={result}
    variables={variables}
    operationName={operationName}
    websocketConnectionParams={websocketConnectionParams}
  />,
  document.querySelector(`#main`)
);
