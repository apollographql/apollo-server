import { createHash } from '@apollo/utils.createhash';

export function computeCoreSchemaHash(schema: string): string {
  return createHash('sha256').update(schema).digest('hex');
}
