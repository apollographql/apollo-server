const runtimeSupportsPromisify = (() => {
  if (
    process &&
    process.release &&
    process.release.name === 'node' &&
    process.versions &&
    typeof process.versions.node === 'string'
  ) {
    const [nodeMajor] = process.versions.node
      .split('.', 1)
      .map(segment => parseInt(segment, 10));

    if (nodeMajor >= 8) {
      return true;
    }
    return false;
  }

  // If we haven't matched any of the above criteria, we'll remain unsupported
  // for this mysterious environment until a pull-request proves us otherwise.
  return false;
})();

export default runtimeSupportsPromisify;
