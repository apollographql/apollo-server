import ApolloServerPluginOperationRegistry from '../ApolloServerPluginOperationRegistry';

describe.only('Operation registry plugin', () => {
  it('will instantiate', () => {
    expect(new ApolloServerPluginOperationRegistry()).toBeInstanceOf(
      ApolloServerPluginOperationRegistry,
    );
  });

  it('will instantiate with debug enabled', () => {
    expect(
      new ApolloServerPluginOperationRegistry({
        debug: true,
      }),
    ).toBeInstanceOf(ApolloServerPluginOperationRegistry);
  });
});
