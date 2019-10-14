import { ApolloError } from '..';

describe('ApolloError', () => {
  it("doesn't overwrite extensions when provided in the constructor", () => {
    const error = new ApolloError('My message', 'A_CODE', {
      extensions: { arbitrary: 'user_data' },
    });

    expect(error.extensions).toEqual({
      code: 'A_CODE',
      arbitrary: 'user_data',
    });


  });

  it("additional message properties don't overwrite the message provided to the constructor", () => {
    const error = new ApolloError('My original message', 'A_CODE', {
      message: 'This message overwrites the original message',
    });

    expect(error.message).toEqual('My original message');
  });
});
