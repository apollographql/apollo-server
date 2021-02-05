import { makeTraceDetails } from '../traceDetails';
import { Trace } from 'apollo-reporting-protobuf';
import { GraphQLError } from 'graphql';

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
    Object.keys(variables).forEach((name) => {
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
  Object.keys(variables).forEach((name) => {
    filteredOutput.variablesJson[name] = '';
  });

  const nonFilteredOutput = new Trace.Details();
  Object.keys(variables).forEach((name) => {
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
    expect(
      makeTraceDetails(
        variables,
        // @ts-ignore Testing untyped usage; only `{ none: true }` is legal.
        { none: false },
      ),
    ).toEqual(nonFilteredOutput);

    expect(
      makeTraceDetails(
        variables,
        // @ts-ignore Testing untyped usage; only `{ all: true }` is legal.
        { all: false },
      ),
    ).toEqual(filteredOutput);
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
    Object.keys(variables).forEach((name) => {
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
    Object.keys(variableJson).forEach((variableName) => {
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
