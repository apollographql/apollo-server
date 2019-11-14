export { default as astSerializer } from './astSerializer';

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
