import runtimeSupportsUploads from './utils/runtimeSupportsUploads';

// We'll memoize this function once at module load time since it should never
// change during runtime.  In the event that we're using a version of Node.js
// less than 8.5.0, we'll
const processFileUploads:
  | typeof import('@apollographql/graphql-upload-8-fork').processRequest
  | undefined = (() => {
  if (runtimeSupportsUploads) {
    return require('@apollographql/graphql-upload-8-fork')
      .processRequest as typeof import('@apollographql/graphql-upload-8-fork').processRequest;
  }
  return undefined;
})();

export default processFileUploads;
