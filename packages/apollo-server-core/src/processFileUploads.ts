/// <reference path="./types/graphql-upload.d.ts" />

import runtimeSupportsUploads from './utils/runtimeSupportsUploads';

// We'll memoize this function once at module load time since it should never
// change during runtime.  In the event that we're using a version of Node.js
// less than 8.5.0, we'll
const processFileUploads:
  | typeof import('graphql-upload').processRequest
  | undefined = (() => {
  if (runtimeSupportsUploads) {
    return require('graphql-upload')
      .processRequest as typeof import('graphql-upload').processRequest;
  }
  return undefined;
})();

export default processFileUploads;
