const runtimeSupportsUploads = (() => {
  if (
    process &&
    process.release &&
    process.release.name === 'node' &&
    process.versions &&
    typeof process.versions.node === 'string'
  ) {
    const [nodeMajor, nodeMinor] = process.versions.node
      .split('.', 2)
      .map(segment => parseInt(segment, 10));

    if (nodeMajor < 8 || (nodeMajor === 8 && nodeMinor < 5)) {
      return false;
    }
    return true;
  }

  // If we haven't matched any of the above criteria, we'll remain unsupported
  // for this mysterious environment until a pull-request proves us otherwise.
  return false;
})();

export default runtimeSupportsUploads;
