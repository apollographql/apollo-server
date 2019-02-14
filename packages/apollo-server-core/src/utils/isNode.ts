export default typeof process === 'object' &&
  process &&
  process.release &&
  process.release.name === 'node' &&
  process.versions &&
  typeof process.versions.node === 'string';
