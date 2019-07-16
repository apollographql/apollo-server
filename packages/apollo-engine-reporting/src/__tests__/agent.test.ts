import {
  signatureCacheKey,
  handleLegacyOptions,
  EngineReportingOptions,
} from '../agent';

describe('signature cache key', () => {
  it('generates without the operationName', () => {
    expect(signatureCacheKey('abc123', '')).toEqual('abc123');
  });

  it('generates without the operationName', () => {
    expect(signatureCacheKey('abc123', 'myOperation')).toEqual(
      'abc123:myOperation',
    );
  });
});

describe("test handleLegacyOptions(), which converts the deprecated privateVariable and privateHeaders options to the new options' formats", () => {
  it('Case 1: privateVariables/privateHeaders == False; same as all', () => {
    const optionsPrivateFalse: EngineReportingOptions<any> = {
      privateVariables: false,
      privateHeaders: false,
    };
    handleLegacyOptions(optionsPrivateFalse);
    expect(optionsPrivateFalse.privateVariables).toBe(undefined);
    expect(optionsPrivateFalse.sendVariableValues).toEqual({ all: true });
    expect(optionsPrivateFalse.privateHeaders).toBe(undefined);
    expect(optionsPrivateFalse.sendHeaders).toEqual({ all: true });
  });

  it('Case 2: privateVariables/privateHeaders == True; same as none', () => {
    const optionsPrivateTrue: EngineReportingOptions<any> = {
      privateVariables: true,
      privateHeaders: true,
    };
    handleLegacyOptions(optionsPrivateTrue);
    expect(optionsPrivateTrue.privateVariables).toBe(undefined);
    expect(optionsPrivateTrue.sendVariableValues).toEqual({ none: true });
    expect(optionsPrivateTrue.privateHeaders).toBe(undefined);
    expect(optionsPrivateTrue.sendHeaders).toEqual({ none: true });
  });

  it('Case 3: privateVariables/privateHeaders set to an array', () => {
    const privateArray: Array<String> = ['t1', 't2'];
    const optionsPrivateArray: EngineReportingOptions<any> = {
      privateVariables: privateArray,
      privateHeaders: privateArray,
    };
    handleLegacyOptions(optionsPrivateArray);
    expect(optionsPrivateArray.privateVariables).toBe(undefined);
    expect(optionsPrivateArray.sendVariableValues).toEqual({
      exceptNames: privateArray,
    });
    expect(optionsPrivateArray.privateHeaders).toBe(undefined);
    expect(optionsPrivateArray.sendHeaders).toEqual({
      exceptNames: privateArray,
    });
  });

  it('Case 4: privateVariables/privateHeaders are null or undefined; no change', () => {
    const optionsPrivateFalse: EngineReportingOptions<any> = {
      privateVariables: undefined,
      privateHeaders: null, // null is not a valid TS input, but check the output anyways
    };
    handleLegacyOptions(optionsPrivateFalse);
    expect(optionsPrivateFalse.privateVariables).toBe(undefined);
    expect(optionsPrivateFalse.sendVariableValues).toBe(undefined);
    expect(optionsPrivateFalse.privateHeaders).toBe(undefined);
    expect(optionsPrivateFalse.sendHeaders).toBe(undefined);
  });

  it('Case 5: throws error when both the new and old options are set', () => {
    const optionsBothVariables: EngineReportingOptions<any> = {
      privateVariables: true,
      sendVariableValues: { none: true },
    };
    expect(() => {
      handleLegacyOptions(optionsBothVariables);
    }).toThrow();
    const optionsBothHeaders: EngineReportingOptions<any> = {
      privateHeaders: true,
      sendHeaders: { none: true },
    };
    expect(() => {
      handleLegacyOptions(optionsBothHeaders);
    }).toThrow();
  });

  it('Case 6: the passed in options are not modified if deprecated fields were not set', () => {
    const optionsNotDeprecated: EngineReportingOptions<any> = {
      sendVariableValues: { exceptNames: ['test'] },
      sendHeaders: { all: true },
    };
    const output: EngineReportingOptions<any> = {
      sendVariableValues: { exceptNames: ['test'] },
      sendHeaders: { all: true },
    };
    handleLegacyOptions(optionsNotDeprecated);
    expect(optionsNotDeprecated).toEqual(output);

    const emptyInput: EngineReportingOptions<any> = {};
    handleLegacyOptions(emptyInput);
    expect(emptyInput).toEqual({});
  });
});
