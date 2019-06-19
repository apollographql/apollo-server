import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import {
  GraphQLExtensionStack,
  enableGraphQLExtensions,
} from 'graphql-extensions';
import { Trace } from 'apollo-engine-reporting-protobuf';
import { graphql } from 'graphql';
import { Request } from 'node-fetch';
import {
  EngineReportingExtension,
  makeTraceDetails,
  makeTraceDetailsLegacy,
  makeHTTPRequestHeaders,
  makeHTTPRequestHeadersLegacy,
} from '../extension';
import { Headers } from 'apollo-server-env';
import { InMemoryLRUCache } from 'apollo-server-caching';

test('trace construction', async () => {
  const typeDefs = `
  type User {
    id: Int
    name: String
    posts(limit: Int): [Post]
  }

  type Post {
    id: Int
    title: String
    views: Int
    author: User
  }

  type Query {
    aString: String
    aBoolean: Boolean
    anInt: Int
    author(id: Int): User
    topPosts(limit: Int): [Post]
  }
`;

  const query = `
    query q {
      author(id: 5) {
        name
        posts(limit: 2) {
          id
        }
      }
      aBoolean
    }
`;

  const schema = makeExecutableSchema({ typeDefs });
  addMockFunctionsToSchema({ schema });
  enableGraphQLExtensions(schema);

  const traces: Array<any> = [];
  function addTrace(
    signature: Promise<string | null>,
    operationName: string,
    trace: Trace,
  ) {
    traces.push({ signature, operationName, trace });
  }

  const reportingExtension = new EngineReportingExtension({}, addTrace);
  const stack = new GraphQLExtensionStack([reportingExtension]);
  const requestDidEnd = stack.requestDidStart({
    request: new Request('http://localhost:123/foo') as any,
    queryString: query,
    requestContext: {
      request: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
      },
      context: {},
      cache: new InMemoryLRUCache(),
    },
  });
  await graphql({
    schema,
    source: query,
    contextValue: { _extensionStack: stack },
  });
  requestDidEnd();
  // XXX actually write some tests
});

/**
 * TESTS FOR sendVariableValues REPORTING OPTION
 */
const variables: Record<string, any> = {
  testing: 'testing',
  t2: 2,
};

test('check variableJson output for sendVariableValues null or undefined (default)', () => {
  // Case 1: No keys/values in variables to be filtered/not filtered
  const emptyOutput = new Trace.Details();
  expect(makeTraceDetails({}, null)).toEqual(emptyOutput);
  expect(makeTraceDetails({}, undefined)).toEqual(emptyOutput);
  expect(makeTraceDetails({})).toEqual(emptyOutput);

  // Case 2: Filter all variables
  const filteredOutput = new Trace.Details();
  Object.keys(variables).forEach(name => {
    filteredOutput.variablesJson[name] = '';
  });
  expect(makeTraceDetails(variables)).toEqual(filteredOutput);
  expect(makeTraceDetails(variables, null)).toEqual(filteredOutput);
  expect(makeTraceDetails(variables, undefined)).toEqual(filteredOutput);
});

test('check variableJson output for sendVariableValues safelist type', () => {
  // Case 1: No keys/values in variables to be filtered/not filtered
  const emptyOutput = new Trace.Details();
  expect(makeTraceDetails({}, { safelistAll: true })).toEqual(emptyOutput);
  expect(makeTraceDetails({}, { safelistAll: false })).toEqual(emptyOutput);

  // Case 2: Filter all variables
  const filteredOutput = new Trace.Details();
  Object.keys(variables).forEach(name => {
    filteredOutput.variablesJson[name] = '';
  });
  expect(makeTraceDetails(variables, { safelistAll: false })).toEqual(
    filteredOutput,
  );

  // Case 3: Do not filter variables
  const nonFilteredOutput = new Trace.Details();
  Object.keys(variables).forEach(name => {
    nonFilteredOutput.variablesJson[name] = JSON.stringify(variables[name]);
  });
  expect(makeTraceDetails(variables, { safelistAll: true })).toEqual(
    nonFilteredOutput,
  );
});

test('variableJson output for privacyEnforcer Array type', () => {
  const privateVariablesArray: string[] = ['testing', 'notInVariables'];
  const expectedVariablesJson = {
    testing: '',
    t2: JSON.stringify(2),
  };
  expect(
    makeTraceDetails(variables, { exceptVariableNames: privateVariablesArray })
      .variablesJson,
  ).toEqual(expectedVariablesJson);
});

test('variableJson output for privacyEnforcer custom function', () => {
  // Custom function that redacts every variable to 100;
  const modifiedValue = 100;
  const customModifier = (input: {
    variables: Record<string, any>;
  }): Record<string, any> => {
    let out: Record<string, any> = {};
    Object.keys(input.variables).map((name: string) => {
      out[name] = modifiedValue;
    });
    return out;
  };

  // Expected output
  const output = new Trace.Details();
  Object.keys(variables).forEach(name => {
    output.variablesJson[name] = JSON.stringify(modifiedValue);
  });

  expect(
    makeTraceDetails(variables, { valueModifier: customModifier }),
  ).toEqual(output);
});

test('safelist=False equivalent to Array(all variables)', () => {
  let privateVariablesArray: string[] = ['testing', 't2'];
  expect(
    makeTraceDetails(variables, { safelistAll: false }).variablesJson,
  ).toEqual(
    makeTraceDetails(variables, { exceptVariableNames: privateVariablesArray })
      .variablesJson,
  );
});

test('original keys in variables match the modified keys', () => {
  const origKeys = Object.keys(variables);
  const firstKey = origKeys[0];
  // remove the first key
  const modifiedKeys = Object.keys(variables).slice(1);
  // add a key
  modifiedKeys.push('new v');

  const modifier = (input: {
    variables: Record<string, any>;
  }): Record<string, any> => {
    let out: Record<string, any> = {};
    Object.keys(modifiedKeys).map((name: string) => {
      out[name] = 100;
    });
    return out;
  };

  expect(
    Object.keys(
      makeTraceDetails(variables, { valueModifier: modifier }).variablesJson,
    ).sort(),
  ).toEqual(origKeys.sort());

  // expect empty string for keys removed by the custom modifier
  expect(
    makeTraceDetails(variables, { valueModifier: modifier }).variablesJson[
      firstKey
    ],
  ).toEqual('');
});

/**
 * Tests to ensure support of the old privateVariables reporting option
 */
test('test variableJson output for to-be-deprecated privateVariable option', () => {
  // Case 1: privateVariables == False; same as safelist all
  expect(makeTraceDetailsLegacy({}, false)).toEqual(
    makeTraceDetails({}, { safelistAll: false }),
  );
  expect(makeTraceDetailsLegacy(variables, false)).toEqual(
    makeTraceDetails(variables, { safelistAll: true }),
  );

  // Case 2: privateVariables is an Array; same as makeTraceDetails
  const privacyEnforcerArray: string[] = ['testing', 'notInVariables'];
  expect(
    makeTraceDetailsLegacy(variables, privacyEnforcerArray).variablesJson,
  ).toEqual(
    makeTraceDetails(variables, { exceptVariableNames: privacyEnforcerArray })
      .variablesJson,
  );
});

function makeTestHTTP(): Trace.HTTP {
  return new Trace.HTTP({
    method: Trace.HTTP.Method.UNKNOWN,
    host: null,
    path: null,
  });
}

const headers = new Headers();
headers.append('name', 'value');
headers.append('authorization', 'blahblah'); // THIS SHOULD NEVER BE SENT

const headersOutput = { name: new Trace.HTTP.Values({ value: ['value'] }) };

/**
 * TESTS FOR sendHeaders REPORTING OPTION
 */
test('test that sendHeaders defaults to hiding all', () => {
  const http = makeTestHTTP();
  makeHTTPRequestHeaders(http, headers, null);
  expect(http.requestHeaders).toEqual({});
  makeHTTPRequestHeaders(http, headers, undefined);
  expect(http.requestHeaders).toEqual({});
  makeHTTPRequestHeaders(http, headers);
  expect(http.requestHeaders).toEqual({});
});

test('test sendHeaders.safelistAll', () => {
  const httpSafelist = makeTestHTTP();
  makeHTTPRequestHeaders(httpSafelist, headers, { safelistAll: true });
  expect(httpSafelist.requestHeaders).toEqual(headersOutput);

  const httpBlocklist = makeTestHTTP();
  makeHTTPRequestHeaders(httpBlocklist, headers, { safelistAll: false });
  expect(httpBlocklist.requestHeaders).toEqual({});
});

test('test sendHeaders.except', () => {
  const except: String[] = ['name', 'notinheaders'];
  const http = makeTestHTTP();
  makeHTTPRequestHeaders(http, headers, { except: except });
  expect(http.requestHeaders).toEqual({});
});

/**
 * And test to ensure support of old privateHeaders ooption
 */
test('test legacy privateHeaders boolean / Array ', () => {
  // Test Array input
  const except: String[] = ['name', 'notinheaders'];
  const httpExcept = makeTestHTTP();
  makeHTTPRequestHeaders(httpExcept, headers, { except: except });
  const httpPrivateHeadersArray = makeTestHTTP();
  makeHTTPRequestHeadersLegacy(httpPrivateHeadersArray, headers, except);
  expect(httpExcept.requestHeaders).toEqual(
    httpPrivateHeadersArray.requestHeaders,
  );

  // Test boolean input safelist vs. privateHeaders false
  const httpSafelist = makeTestHTTP();
  makeHTTPRequestHeaders(httpSafelist, headers, { safelistAll: true });
  const httpPrivateHeadersFalse = makeTestHTTP();
  makeHTTPRequestHeadersLegacy(httpPrivateHeadersFalse, headers, false);
  expect(httpSafelist.requestHeaders).toEqual(
    httpPrivateHeadersFalse.requestHeaders,
  );

  // Test boolean input blocklist vs. privateHeaders true
  const httpBlocklist = makeTestHTTP();
  makeHTTPRequestHeaders(httpBlocklist, headers, { safelistAll: false });
  const httpPrivateHeadersTrue = makeTestHTTP();
  makeHTTPRequestHeadersLegacy(httpPrivateHeadersTrue, headers, true);
  expect(httpBlocklist.requestHeaders).toEqual(
    httpPrivateHeadersTrue.requestHeaders,
  );
});
