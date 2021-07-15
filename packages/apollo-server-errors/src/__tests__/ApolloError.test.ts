import { ApolloError, ForbiddenError, AuthenticationError } from '..';

describe('ApolloError', () => {
  it("doesn't overwrite extensions when provided in the constructor", () => {
    const error = new ApolloError('My message', 'A_CODE', {
      arbitrary: 'user_data',
    });

    expect(error.extensions).toEqual({
      code: 'A_CODE',
      arbitrary: 'user_data',
    });
  });

  it("a code property doesn't overwrite the code provided to the constructor", () => {
    const error = new ApolloError('My message', 'A_CODE', {
      code: 'CANT_OVERWRITE',
    });

    expect(error.extensions).toEqual({
      code: 'A_CODE',
    });
  });

  // This is a byproduct of how we currently assign properties from the 3rd constructor
  // argument onto properties of the class itself. This is expected, but deprecated behavior
  // and as such this test should be deleted in the future when we make that breaking change.
  it("a message property doesn't overwrite the message provided to the constructor", () => {
    const error = new ApolloError('My original message', 'A_CODE', {
      message:
        "This message can't overwrite the original message, but it does end up in extensions",
    });

    expect(error.message).toEqual('My original message');
    expect(error.extensions.message).toEqual(
      "This message can't overwrite the original message, but it does end up in extensions",
    );
  });

  it('throws for users who use an extensions key in the third constructor argument', () => {
    expect(
      () =>
        new ApolloError('My original message', 'A_CODE', {
          extensions: {
            arbitrary: 'user_data',
          },
        }),
    ).toThrow(/Pass extensions directly/);
  });
});

describe('ForbiddenError', () => {
  it('supports abritrary data being passed', () => {
    const error = new ForbiddenError('My message', {
      arbitrary: 'user_data',
    });

    expect(error.extensions).toEqual({
      code: 'FORBIDDEN',
      arbitrary: 'user_data',
    });
  });
});

describe('AuthenticationError', () => {
  it('supports abritrary data being passed', () => {
    const error = new AuthenticationError('My message', {
      arbitrary: 'user_data',
    });

    expect(error.extensions).toEqual({
      code: 'UNAUTHENTICATED',
      arbitrary: 'user_data',
    });
  });
});
