const protobuf = require('./protobuf');
const protobufJS = require('@apollo/protobufjs/minimal');

// Remove Long support.  Our uint64s tend to be small (less
// than 104 days).
// XXX Just remove this in our fork?
// https://github.com/protobufjs/protobuf.js/issues/1253
protobufJS.util.Long = undefined;
protobufJS.configure();

module.exports = protobuf;
