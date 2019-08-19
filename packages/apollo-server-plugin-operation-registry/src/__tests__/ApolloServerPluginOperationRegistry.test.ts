import plugin from '../ApolloServerPluginOperationRegistry';

describe('Operation registry plugin', () => {
  it('will instantiate when not called with options', () => {
    expect(plugin()()).toHaveProperty('serverWillStart');
  });

  it('will instantiate with debug enabled', () => {
    expect(plugin({ debug: true })()).toHaveProperty('serverWillStart');
  });
});
