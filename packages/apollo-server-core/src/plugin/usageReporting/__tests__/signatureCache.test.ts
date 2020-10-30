import { signatureCacheKey } from '../signatureCache';

describe('signature cache key', () => {
  it('generates without the operationName', () => {
    expect(signatureCacheKey('abc123', '')).toEqual('abc123');
  });

  it('generates with the operationName', () => {
    expect(signatureCacheKey('abc123', 'myOperation')).toEqual(
      'abc123:myOperation',
    );
  });
});
