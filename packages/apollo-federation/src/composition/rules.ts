import { specifiedSDLRules } from 'graphql/validation/specifiedRules';

import {
  UniqueTypeNamesWithoutEnumsOrScalars,
  matchingEnums,
} from './validate/sdl';

const omit = [
  'UniqueDirectivesPerLocation',
  'UniqueTypeNames',
  'UniqueEnumValueNames',
];

export const compositionRules = specifiedSDLRules
  .filter(rule => !omit.includes(rule.name))
  .concat([UniqueTypeNamesWithoutEnumsOrScalars, matchingEnums]);
