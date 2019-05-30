import astSerializer from './astSerializer';
import selectionSetSerializer from './selectionSetSerializer';
import typeSerializer from './typeSerializer';
export { astSerializer, selectionSetSerializer, typeSerializer };

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
