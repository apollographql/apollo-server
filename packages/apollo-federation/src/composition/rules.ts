import { specifiedSDLRules } from 'graphql/validation/specifiedRules';

export const compositionRules = specifiedSDLRules.filter(
  rule => rule.name !== 'UniqueDirectivesPerLocation',
);
