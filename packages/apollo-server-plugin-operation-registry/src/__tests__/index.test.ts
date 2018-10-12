import ApolloServerPlugin from '../';

describe.only('Operation registry plugin', () => {
  it('will instantiate', () => {
    expect(new ApolloServerPlugin()).toBeInstanceOf(ApolloServerPlugin);
  });

  it('will instantiate with debug enabled', () => {
    expect(
      new ApolloServerPlugin({
        debug: true,
      }),
    ).toBeInstanceOf(ApolloServerPlugin);
  });

  describe('serverWillStart will launch agent', () => {
    it('makes the request', () => {
      expect('');
    });
    // jest.spyOn(global.console, 'warn')
  });
});
