import plugin from '../ApolloServerPluginResponseCache';
import { describe, it, expect } from '@jest/globals';

describe('Response cache plugin', () => {
  it('will instantiate when not called with options', () => {
    expect(plugin()).toHaveProperty('requestDidStart');
  });
});
