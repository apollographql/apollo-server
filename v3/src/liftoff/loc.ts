const locations = new WeakMap<any, Error>()

export function setLocation(tag: any, at?: any) {
  if (locations.has(tag)) return
  const loc = getLocation(at) || new Error()
  locations.set(tag, loc)
}

export function getLocation(tag: any) {
  return locations.get(tag)
}

export function getStack(tag: any) {
  return locations.get(tag)?.stack
}
