// This currently provides the ability to have syntax highlighting as well as
// consistency between client and server gql tags
import type { DocumentNode } from 'graphql';
import gqlTag from 'graphql-tag';
export const gql: (
  template: TemplateStringsArray | string,
  ...substitutions: any[]
) => DocumentNode = gqlTag;
