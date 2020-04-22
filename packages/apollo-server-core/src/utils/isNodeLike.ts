export default typeof process === 'object' &&
  process &&
  // We used to check `process.release.name === "node"`, however that doesn't
  // account for certain forks of Node.js which are otherwise identical to
  // Node.js.  For example, NodeSource's N|Solid reports itself as "nsolid",
  // though it's mostly the same build of Node.js with an extra addon.
  process.release &&
  process.versions &&
  // The one thing which is present on both Node.js and N|Solid (a fork of
  // Node.js), is `process.versions.node` being defined.
  typeof process.versions.node === 'string';
