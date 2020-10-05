import { legacyOptionsToPluginOptions } from '../legacyOptions';
import {
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidEncounterErrors,
} from 'apollo-server-types';
import { GraphQLError } from 'graphql';

describe('doubly-legacy privateVariables and privateHeaders options', () => {
  it('privateVariables/privateHeaders == false; same as all', () => {
    const optionsPrivateFalse = legacyOptionsToPluginOptions({
      privateVariables: false,
      privateHeaders: false,
    });
    expect(optionsPrivateFalse.sendVariableValues).toEqual({ all: true });
    expect(optionsPrivateFalse.sendHeaders).toEqual({ all: true });
  });

  it('privateVariables/privateHeaders == true; same as none', () => {
    const optionsPrivateTrue = legacyOptionsToPluginOptions({
      privateVariables: true,
      privateHeaders: true,
    });
    expect(optionsPrivateTrue.sendVariableValues).toEqual({ none: true });
    expect(optionsPrivateTrue.sendHeaders).toEqual({ none: true });
  });

  it('privateVariables/privateHeaders set to an array', () => {
    const privateArray: Array<String> = ['t1', 't2'];
    const optionsPrivateArray = legacyOptionsToPluginOptions({
      privateVariables: privateArray,
      privateHeaders: privateArray,
    });
    expect(optionsPrivateArray.sendVariableValues).toEqual({
      exceptNames: privateArray,
    });
    expect(optionsPrivateArray.sendHeaders).toEqual({
      exceptNames: privateArray,
    });
  });

  it('privateVariables/privateHeaders are null or undefined; no change', () => {
    const optionsPrivateFalse = legacyOptionsToPluginOptions({
      privateVariables: undefined,
      privateHeaders: null, // null is not a valid TS input, but check the output anyways
    } as any);
    expect(optionsPrivateFalse.sendVariableValues).toBe(undefined);
    expect(optionsPrivateFalse.sendHeaders).toBe(undefined);
  });

  it('throws error when both the new and old options are set', () => {
    expect(() =>
      legacyOptionsToPluginOptions({
        privateVariables: true,
        sendVariableValues: { none: true },
      }),
    ).toThrow('set both the');
    expect(() =>
      legacyOptionsToPluginOptions({
        privateHeaders: true,
        sendHeaders: { none: true },
      }),
    ).toThrow('set both the');
  });

  it('the newer options are preserved', () => {
    expect(
      legacyOptionsToPluginOptions({
        sendVariableValues: { exceptNames: ['test'] },
        sendHeaders: { all: true },
      }),
    ).toEqual({
      sendVariableValues: { exceptNames: ['test'] },
      sendHeaders: { all: true },
    });
  });
});

it('reportTiming', () => {
  const f = async (
    _request:
      | GraphQLRequestContextDidResolveOperation<any>
      | GraphQLRequestContextDidEncounterErrors<any>,
  ) => true;
  expect(legacyOptionsToPluginOptions({ reportTiming: f })).toEqual({
    includeRequest: f,
  });
});

it('maskErrorDetails', () => {
  const newOptions = legacyOptionsToPluginOptions({ maskErrorDetails: true });
  expect(newOptions.rewriteError).toBeTruthy();
  expect(newOptions.rewriteError!(new GraphQLError('foo'))?.message).toBe(
    '<masked>',
  );
});
