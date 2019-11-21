import { setLocation, getLocation, getStack } from './loc'

describe('source locations — ', () => {
  const obj = {}; setLocation(obj)

  it('setLocation sets the location of an object as an error; getLocation returns it', () => {
    expect(getLocation(obj)).toBeDefined()
  })

  it('getStack gives you the stack', () => {
    expect(getStack(obj)).toBeDefined()
    expect(getStack(obj)).toMatch('loc.test.ts:4')
  })

  it('setLocation is idempotent', () => {
    const e = getLocation(obj)
    setLocation(obj)
    expect(getLocation(obj)).toBe(e)
  })

  it('setLocation(x, y) sets the location of x to be the location of y', () => {
    const other = {}
    setLocation(other, obj)
    expect(getLocation(other)).toBe(getLocation(obj))
  })


  let location: Error | void = void 0
  function tag(parts: TemplateStringsArray) {
    setLocation(parts)
    return getLocation(parts)
  }

  function testTag() {
    const loc = tag `hello world`
    if (!location) {
      location = loc
      return
    }
    expect(location).toBe(loc)
  }

  it('interestingly, template literal objects are allocated once per callsite', () => {
    testTag()
    testTag()
  })
})
