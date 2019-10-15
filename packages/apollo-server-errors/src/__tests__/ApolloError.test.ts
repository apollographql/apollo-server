import { ApolloError } from '..';

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

  it('(back-compat) sets extensions correctly for users who use an extensions key in the third constructor argument', () => {
    const error = new ApolloError('My original message', 'A_CODE', {
      extensions: {
        arbitrary: 'user_data',
      },
    });

    expect(error.extensions.arbitrary).toEqual('user_data');
  });
});
