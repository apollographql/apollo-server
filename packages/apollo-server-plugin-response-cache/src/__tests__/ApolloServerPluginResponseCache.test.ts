import plugin from '../ApolloServerPluginResponseCache';

describe('Response cache plugin', () => {
  it('will instantiate when not called with options', () => {
    expect(plugin()).toHaveProperty('requestDidStart');
  });
});
