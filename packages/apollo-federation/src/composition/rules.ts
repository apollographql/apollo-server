import { specifiedSDLRules } from 'graphql/validation/specifiedRules';

import {
  UniqueTypeNamesWithoutEnumsOrScalars,
  MatchingEnums,
} from './validate/sdl';

const omit = [
  'UniqueDirectivesPerLocation',
  'UniqueTypeNames',
  'UniqueEnumValueNames',
];

export const compositionRules = specifiedSDLRules
  .filter(rule => !omit.includes(rule.name))
  .concat([UniqueTypeNamesWithoutEnumsOrScalars, MatchingEnums]);
