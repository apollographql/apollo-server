import { ForbiddenError, AuthenticationError } from '../errors';

describe('ForbiddenError', () => {
  it('supports arbitrary data being passed', () => {
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
  it('supports arbitrary data being passed', () => {
    const error = new AuthenticationError('My message', {
      arbitrary: 'user_data',
    });

    expect(error.extensions).toEqual({
      code: 'UNAUTHENTICATED',
      arbitrary: 'user_data',
    });
  });
});
