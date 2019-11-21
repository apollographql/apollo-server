import { RefType, __ref_testing__ } from './ref'
import { TypeCheck, checkString } from '../test-helpers'

const { createRefType } = __ref_testing__

describe('createRefType creates ref types', () => {
  const string = createRefType<string> `string`

  it('with a location', () =>
    expect(getLocation(string)).toBeDefined())

  testIsRefType(string, checkString)
})

import { getLocation } from './loc'

function testIsRefType<T>(ref: RefType<T>, check: TypeCheck<T>) {
  describe(`${ref} creates Ref<${check.typeName}>`, () => {
    it('with a location', () =>
      expect(getLocation(ref)).toBeDefined())

    it('creates ref with a location', () =>
      expect(getLocation(ref `a ref`)).toBeDefined())

    it(`creates refs accepting ${check.typeName} values`, () =>
      ref `another ref` (check.example))
  })
}
