export { default as astSerializer } from './astSerializer';
export { default as selectionSetSerializer } from './selectionSetSerializer';
export { default as typeSerializer } from './typeSerializer';
export { default as graphqlErrorSerializer } from './graphqlErrorSerializer';

declare global {
  namespace jest {
    interface Expect {
      /**
       * Adds a module to format application-specific data structures for serialization.
       */
      addSnapshotSerializer(serializer: import('pretty-format').Plugin): void;
    }
  }
}
