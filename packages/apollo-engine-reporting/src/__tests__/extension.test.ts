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
} from '../extension';
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

const variables: Record<string, any> = {
  testing: 'testing',
  t2: 2,
};

test('check variableJson output for privacyEnforcer boolean type', () => {
  // Case 1: No keys/values in variables to be filtered/not filtered
  const emptyOutput = new Trace.Details();
  expect(makeTraceDetails({}, { always: true })).toEqual(emptyOutput);
  expect(makeTraceDetails({}, { always: false })).toEqual(emptyOutput);

  // Case 2: Filter all variables
  const filteredOutput = new Trace.Details();
  Object.keys(variables).forEach(name => {
    filteredOutput.variablesJson[name] = '';
  });
  expect(makeTraceDetails(variables, { always: true })).toEqual(filteredOutput);

  // Case 3: Do not filter variables
  const nonFilteredOutput = new Trace.Details();
  Object.keys(variables).forEach(name => {
    nonFilteredOutput.variablesJson[name] = JSON.stringify(variables[name]);
  });
  expect(makeTraceDetails(variables, { always: false })).toEqual(
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
    makeTraceDetails(variables, { privateVariableNames: privateVariablesArray })
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

test('privacyEnforcer=True equivalent to privacyEnforcer=Array(all variables)', () => {
  let privateVariablesArray: string[] = ['testing', 't2'];
  expect(makeTraceDetails(variables, { always: true }).variablesJson).toEqual(
    makeTraceDetails(variables, { privateVariableNames: privateVariablesArray })
      .variablesJson,
  );
});

test('original keys in variables match the modified keys', () => {
  const origKeys = Object.keys(variables);
  const modifiedKeys = Object.keys(variables).slice(1);
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
});

/**
 * Tests for old privateVariables reporting option
 */

test('test variableJson output for to-be-deprecated privateVariable option', () => {
  // Case 1: privateVariables == False; same as makeTraceDetails
  expect(makeTraceDetailsLegacy({}, false)).toEqual(
    makeTraceDetails({}, { always: false }),
  );
  expect(makeTraceDetailsLegacy(variables, false)).toEqual(
    makeTraceDetails(variables, { always: false }),
  );

  // Case 2: privateVariables is an Array; same as makeTraceDetails
  const privacyEnforcerArray: string[] = ['testing', 'notInVariables'];
  expect(
    makeTraceDetailsLegacy(variables, privacyEnforcerArray).variablesJson,
  ).toEqual(
    makeTraceDetails(variables, { privateVariableNames: privacyEnforcerArray })
      .variablesJson,
  );
});

test('original keys in variables match the modified keys', () => {
  const origKeys = Object.keys(variables);
  const modifiedKeys = Object.keys(variables).slice(1);
  modifiedKeys.push('new v');

  const enforcer = (input: Record<string, any>): Record<string, any> => {
    let out: Record<string, any> = {};
    Object.keys(modifiedKeys).map((name: string) => {
      out[name] = 100;
    });
    return out;
  };

  expect(
    Object.keys(makeTraceDetails(variables, enforcer).variablesJson).sort(),
  ).toEqual(origKeys.sort());
});
