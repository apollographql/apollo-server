import { createHash } from '@apollo/utils.createhash';

// This hash function is used in both the schema reporting and usage reporting
// plugins. Making sure we use the same hash function hypothetically allows the
// two reporting features to work well together, though in practice nothing on
// the Studio side currently correlates this ID across both features.
export function computeCoreSchemaHash(schema: string): string {
  return createHash('sha256').update(schema).digest('hex');
}
