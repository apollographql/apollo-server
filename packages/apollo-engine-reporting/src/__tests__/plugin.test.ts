import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { graphql, GraphQLError, printSchema } from 'graphql';
import { Request } from 'node-fetch';
import { makeTraceDetails, makeHTTPRequestHeaders, plugin } from '../plugin';
import { Headers } from 'apollo-server-env';
import { computeExecutableSchemaId } from '../agent';
import { Trace } from 'apollo-engine-reporting-protobuf';
import pluginTestHarness from 'apollo-server-core/dist/utils/pluginTestHarness';

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

const queryReport = `
    query report {
      author(id: 5) {
        name
        posts(limit: 2) {
          id
        }
      }
      aBoolean
    }
`;

describe('schema reporting', () => {
  const schema = makeExecutableSchema({ typeDefs });
  addMockFunctionsToSchema({ schema });

  const addTrace = jest.fn(() => Promise.resolve());
  const startSchemaReporting = jest.fn();
  const executableSchemaIdGenerator = jest.fn(computeExecutableSchemaId);

  beforeEach(() => {
    addTrace.mockClear();
    startSchemaReporting.mockClear();
    executableSchemaIdGenerator.mockClear();
  });

  it('starts reporting if enabled', async () => {
    const pluginInstance = plugin(
      {},
      addTrace,
      {
        startSchemaReporting,
        executableSchemaIdGenerator,
        schemaReport: true,
      }
    );

    await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });

    expect(startSchemaReporting).toBeCalledTimes(1);
    expect(startSchemaReporting).toBeCalledWith({
      executableSchema: printSchema(schema),
      executableSchemaId: executableSchemaIdGenerator(schema),
    });
  });

  it('uses the override schema', async () => {
    const pluginInstance = plugin(
      {
        overrideReportedSchema: typeDefs,
      },
      addTrace,
      {
        startSchemaReporting,
        executableSchemaIdGenerator,
        schemaReport: true,
      },
    );

    await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });

    const expectedExecutableSchemaId = executableSchemaIdGenerator(typeDefs);
    expect(startSchemaReporting).toBeCalledTimes(1);
    expect(startSchemaReporting).toBeCalledWith({
      executableSchema: typeDefs,
      executableSchemaId: expectedExecutableSchemaId,
    });

    // Get the first argument from the first time this is called.
    // Not using called with because that has to be exhaustive and this isn't
    // testing trace generation
    expect(addTrace).toBeCalledWith(
      expect.objectContaining({
        executableSchemaId: expectedExecutableSchemaId,
      }),
    );
  });

  it('uses the same executable schema id for metric reporting', async () => {
    const pluginInstance = plugin(
      {},
      addTrace,
      {
        startSchemaReporting,
        executableSchemaIdGenerator,
        schemaReport: true,
      }
    );

    await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });

    const expectedExecutableSchemaId = executableSchemaIdGenerator(schema);
    expect(startSchemaReporting).toBeCalledTimes(1);
    expect(startSchemaReporting).toBeCalledWith({
      executableSchema: printSchema(schema),
      executableSchemaId: expectedExecutableSchemaId,
    });
    // Get the first argument from the first time this is called.
    // Not using called with because that has to be exhaustive and this isn't
    // testing trace generation
    expect(addTrace.mock.calls[0][0].executableSchemaId).toBe(
      expectedExecutableSchemaId,
    );
  });
});

it('trace construction', async () => {
  const schema = makeExecutableSchema({ typeDefs });
  addMockFunctionsToSchema({ schema });

  const startSchemaReporting = jest.fn();
  const executableSchemaIdGenerator = jest.fn();
  const addTrace = jest.fn(() => Promise.resolve());

  const pluginInstance = plugin(
    {
      /* no options!*/
    },
    addTrace,
    {
      startSchemaReporting,
      executableSchemaIdGenerator,
    },
  );

  await pluginTestHarness({
    pluginInstance,
    schema,
    graphqlRequest: {
      query,
      operationName: 'q',
      extensions: {
        clientName: 'testing suite',
      },
      http: new Request('http://localhost:123/foo'),
    },
    executor: async ({ request: { query: source } }) => {
      return await graphql({
        schema,
        source,
      });
    },
  });

  // XXX actually write some tests
});

/**
 * TESTS FOR sendVariableValues REPORTING OPTION
 */
const variables: Record<string, any> = {
  testing: 'testing',
  t2: 2,
};

describe('check variableJson output for sendVariableValues null or undefined (default)', () => {
  it('Case 1: No keys/values in variables to be filtered/not filtered', () => {
    const emptyOutput = new Trace.Details();
    expect(makeTraceDetails({})).toEqual(emptyOutput);
    expect(makeTraceDetails({}, undefined)).toEqual(emptyOutput);
    expect(makeTraceDetails({})).toEqual(emptyOutput);
  });
  it('Case 2: Filter all variables', () => {
    const filteredOutput = new Trace.Details();
    Object.keys(variables).forEach(name => {
      filteredOutput.variablesJson[name] = '';
    });
    expect(makeTraceDetails(variables)).toEqual(filteredOutput);
    expect(makeTraceDetails(variables)).toEqual(filteredOutput);
    expect(makeTraceDetails(variables, undefined)).toEqual(filteredOutput);
  });
});

describe('check variableJson output for sendVariableValues all/none type', () => {
  it('Case 1: No keys/values in variables to be filtered/not filtered', () => {
    const emptyOutput = new Trace.Details();
    expect(makeTraceDetails({}, { all: true })).toEqual(emptyOutput);
    expect(makeTraceDetails({}, { none: true })).toEqual(emptyOutput);
  });

  const filteredOutput = new Trace.Details();
  Object.keys(variables).forEach(name => {
    filteredOutput.variablesJson[name] = '';
  });

  const nonFilteredOutput = new Trace.Details();
  Object.keys(variables).forEach(name => {
    nonFilteredOutput.variablesJson[name] = JSON.stringify(variables[name]);
  });

  it('Case 2: Filter all variables', () => {
    expect(makeTraceDetails(variables, { none: true })).toEqual(filteredOutput);
  });

  it('Case 3: Do not filter variables', () => {
    expect(makeTraceDetails(variables, { all: true })).toEqual(
      nonFilteredOutput,
    );
  });

  it('Case 4: Check behavior for invalid inputs', () => {
    expect(makeTraceDetails(variables,
      // @ts-ignore Testing untyped usage; only `{ none: true }` is legal.
      { none: false }
    )).toEqual(
      nonFilteredOutput,
    );

    expect(makeTraceDetails(variables,
      // @ts-ignore Testing untyped usage; only `{ all: true }` is legal.
      { all: false }
    )).toEqual(filteredOutput);
  });
});

describe('variableJson output for sendVariableValues exceptNames: Array type', () => {
  it('array contains some values not in keys', () => {
    const privateVariablesArray: string[] = ['testing', 'notInVariables'];
    const expectedVariablesJson = {
      testing: '',
      t2: JSON.stringify(2),
    };
    expect(
      makeTraceDetails(variables, { exceptNames: privateVariablesArray })
        .variablesJson,
    ).toEqual(expectedVariablesJson);
  });

  it('none=true equivalent to exceptNames=[all variables]', () => {
    const privateVariablesArray: string[] = ['testing', 't2'];
    expect(makeTraceDetails(variables, { none: true }).variablesJson).toEqual(
      makeTraceDetails(variables, { exceptNames: privateVariablesArray })
        .variablesJson,
    );
  });
});

describe('variableJson output for sendVariableValues onlyNames: Array type', () => {
  it('array contains some values not in keys', () => {
    const privateVariablesArray: string[] = ['t2', 'notInVariables'];
    const expectedVariablesJson = {
      testing: '',
      t2: JSON.stringify(2),
    };
    expect(
      makeTraceDetails(variables, { onlyNames: privateVariablesArray })
        .variablesJson,
    ).toEqual(expectedVariablesJson);
  });

  it('all=true equivalent to onlyNames=[all variables]', () => {
    const privateVariablesArray: string[] = ['testing', 't2'];
    expect(makeTraceDetails(variables, { all: true }).variablesJson).toEqual(
      makeTraceDetails(variables, { onlyNames: privateVariablesArray })
        .variablesJson,
    );
  });

  it('none=true equivalent to onlyNames=[]', () => {
    const privateVariablesArray: string[] = [];
    expect(makeTraceDetails(variables, { none: true }).variablesJson).toEqual(
      makeTraceDetails(variables, { onlyNames: privateVariablesArray })
        .variablesJson,
    );
  });
});

describe('variableJson output for sendVariableValues transform: custom function type', () => {
  it('test custom function that redacts every variable to some value', () => {
    const modifiedValue = 100;
    const customModifier = (input: {
      variables: Record<string, any>;
    }): Record<string, any> => {
      const out: Record<string, any> = Object.create(null);
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

    expect(makeTraceDetails(variables, { transform: customModifier })).toEqual(
      output,
    );
  });

  const origKeys = Object.keys(variables);
  const firstKey = origKeys[0];
  const secondKey = origKeys[1];

  const modifier = (input: {
    variables: Record<string, any>;
  }): Record<string, any> => {
    const out: Record<string, any> = Object.create(null);
    Object.keys(input.variables).map((name: string) => {
      out[name] = null;
    });
    // remove the first key, and then add a new key
    delete out[firstKey];
    out['newkey'] = 'blah';
    return out;
  };

  it('original keys in variables should match the modified keys', () => {
    expect(
      Object.keys(
        makeTraceDetails(variables, { transform: modifier }).variablesJson,
      ).sort(),
    ).toEqual(origKeys.sort());
  });

  it('expect empty string for keys removed by the custom modifier', () => {
    expect(
      makeTraceDetails(variables, { transform: modifier }).variablesJson[
        firstKey
      ],
    ).toEqual('');
  });

  it('expect stringify(null) for values set to null by custom modifier', () => {
    expect(
      makeTraceDetails(variables, { transform: modifier }).variablesJson[
        secondKey
      ],
    ).toEqual(JSON.stringify(null));
  });

  const errorThrowingModifier = (_input: {
    variables: Record<string, any>;
  }): Record<string, any> => {
    throw new GraphQLError('testing error handling');
  };

  it('redact all variable values when custom modifier throws an error', () => {
    const variableJson = makeTraceDetails(variables, {
      transform: errorThrowingModifier,
    }).variablesJson;
    Object.keys(variableJson).forEach(variableName => {
      expect(variableJson[variableName]).toEqual(
        JSON.stringify('[PREDICATE_FUNCTION_ERROR]'),
      );
    });
    expect(Object.keys(variableJson).sort()).toEqual(
      Object.keys(variables).sort(),
    );
  });
});

describe('Catch circular reference error during JSON.stringify', () => {
  interface SelfCircular {
    self?: SelfCircular;
  }

  const circularReference: SelfCircular = {};
  circularReference['self'] = circularReference;

  const circularVariables = {
    bad: circularReference,
  };

  expect(
    makeTraceDetails(circularVariables, { all: true }).variablesJson['bad'],
  ).toEqual(JSON.stringify('[Unable to convert value to JSON]'));
});

function makeTestHTTP(): Trace.HTTP {
  return new Trace.HTTP({
    method: Trace.HTTP.Method.UNKNOWN,
    host: null,
    path: null,
  });
}

describe('tests for the "reportTiming', () => {
  const schemaReportingFunctions = {
    startSchemaReporting: jest.fn(),
    executableSchemaIdGenerator: jest.fn(),
  };
  const schema = makeExecutableSchema({ typeDefs });
  addMockFunctionsToSchema({ schema });

  const addTrace = jest.fn(() => Promise.resolve());
  beforeEach(() => {
    addTrace.mockClear();
  });

  it('report no traces', async () => {
    const pluginInstance = plugin(
      { reportTiming: false },
      addTrace,
      schemaReportingFunctions,
    );

    const context = await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });
    expect(context.metrics.captureTraces).toBeFalsy();
  });

  it('report traces based on operation name', async () => {
    const pluginInstance = plugin(
      {
        reportTiming: async request => {
          return request.request.operationName === 'report';
        },
      },
      addTrace,
      schemaReportingFunctions,
    );

    const context1 = await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query: queryReport,
        operationName: 'report',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });

    expect(addTrace).toBeCalledTimes(1);
    expect(context1.metrics.captureTraces).toBeTruthy();
    addTrace.mockClear();

    const context2 = await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });

    expect(addTrace).not.toBeCalled();
    expect(context2.metrics.captureTraces).toBeFalsy();
  });

  it('report traces async based on operation name', async () => {
    const pluginInstance = plugin(
      {
        reportTiming: async request => {
          return await (async () => {
            return request.request.operationName === 'report';
          })();
        },
      },
      addTrace,
      schemaReportingFunctions
    );

    const context1 = await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query: queryReport,
        operationName: 'report',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });

    expect(addTrace).toBeCalledTimes(1);
    expect(context1.metrics.captureTraces).toBeTruthy();
    addTrace.mockClear();

    const context2 = await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source } }) => {
        return await graphql({
          schema,
          source,
        });
      },
    });

    expect(addTrace).not.toBeCalled();
    expect(context2.metrics.captureTraces).toBeFalsy();
  });
});

/**
 * TESTS FOR THE sendHeaders REPORTING OPTION
 */
const headers = new Headers();
headers.append('name', 'value');
headers.append('authorization', 'blahblah'); // THIS SHOULD NEVER BE SENT

const headersOutput = { name: new Trace.HTTP.Values({ value: ['value'] }) };

describe('tests for the sendHeaders reporting option', () => {
  it('sendHeaders defaults to hiding all', () => {
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers,
      // @ts-ignore: `null` is not a valid type; check output on invalid input.
      null
    );
    expect(http.requestHeaders).toEqual({});
    makeHTTPRequestHeaders(http, headers, undefined);
    expect(http.requestHeaders).toEqual({});
    makeHTTPRequestHeaders(http, headers);
    expect(http.requestHeaders).toEqual({});
  });

  it('sendHeaders.all and sendHeaders.none', () => {
    const httpSafelist = makeTestHTTP();
    makeHTTPRequestHeaders(httpSafelist, headers, { all: true });
    expect(httpSafelist.requestHeaders).toEqual(headersOutput);

    const httpBlocklist = makeTestHTTP();
    makeHTTPRequestHeaders(httpBlocklist, headers, { none: true });
    expect(httpBlocklist.requestHeaders).toEqual({});
  });

  it('invalid inputs for sendHeaders.all and sendHeaders.none', () => {
    const httpSafelist = makeTestHTTP();
    makeHTTPRequestHeaders(httpSafelist, headers,
      // @ts-ignore Testing untyped usage; only `{ none: true }` is legal.
      { none: false }
    );
    expect(httpSafelist.requestHeaders).toEqual(headersOutput);

    const httpBlocklist = makeTestHTTP();
    makeHTTPRequestHeaders(httpBlocklist, headers,
      // @ts-ignore Testing untyped usage; only `{ all: true }` is legal.
      { all: false }
    );
    expect(httpBlocklist.requestHeaders).toEqual({});
  });

  it('test sendHeaders.exceptNames', () => {
    const except: String[] = ['name', 'notinheaders'];
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { exceptNames: except });
    expect(http.requestHeaders).toEqual({});
  });

  it('test sendHeaders.onlyNames', () => {
    // headers that should never be sent (such as "authorization") should still be removed if in includeHeaders
    const include: String[] = ['name', 'authorization', 'notinheaders'];
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { onlyNames: include });
    expect(http.requestHeaders).toEqual(headersOutput);
  });

  it('authorization, cookie, and set-cookie headers should never be sent', () => {
    headers.append('cookie', 'blahblah');
    headers.append('set-cookie', 'blahblah');
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { all: true });
    expect(http.requestHeaders['authorization']).toBe(undefined);
    expect(http.requestHeaders['cookie']).toBe(undefined);
    expect(http.requestHeaders['set-cookie']).toBe(undefined);
  });
});
