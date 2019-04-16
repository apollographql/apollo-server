const protobuf = require('./protobuf');

// Override the generated protobuf Traces.encode function so that it will look
// for Traces that are already encoded to Buffer as well as unencoded
// Traces. This amortizes the protobuf encoding time over each generated Trace
// instead of bunching it all up at once at sendReport time. In load tests, this
// change improved p99 end-to-end HTTP response times by a factor of 11 without
// a casually noticeable effect on p50 times. This also makes it easier for us
// to implement maxUncompressedReportSize as we know the encoded size of traces
// as we go.
const originalTracesEncode = protobuf.Traces.encode;
protobuf.Traces.encode = function(message, originalWriter) {
  const writer = originalTracesEncode(message, originalWriter);
  const encodedTraces = message.encodedTraces;
  if (encodedTraces != null && encodedTraces.length) {
    for (let i = 0; i < encodedTraces.length; ++i) {
      writer.uint32(/* id 1, wireType 2 =*/ 10);
      writer.bytes(encodedTraces[i]);
    }
  }
  return writer;
};

module.exports = protobuf;
