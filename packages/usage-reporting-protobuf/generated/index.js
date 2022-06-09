const protobuf = require('./protobuf');
const protobufJS = require('@apollo/protobufjs/minimal');

// Remove Long support.  Our uint64s tend to be small (less
// than 104 days).
// XXX Just remove this in our fork? We already deleted
// the generation of Long in protobuf.d.ts in the fork.
// https://github.com/protobufjs/protobuf.js/issues/1253
protobufJS.util.Long = undefined;
protobufJS.configure();

module.exports = protobuf;
