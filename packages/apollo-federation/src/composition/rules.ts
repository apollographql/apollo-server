import { specifiedSDLRules } from 'graphql/validation/specifiedRules';

import {
  UniqueTypeNamesWithoutEnumsOrScalars,
  MatchingEnums,
  PossibleTypeExtensions,
} from './validate/sdl';

const omit = [
  'UniqueDirectivesPerLocation',
  'UniqueTypeNames',
  'UniqueEnumValueNames',
  'PossibleTypeExtensions',
];

export const compositionRules = specifiedSDLRules
  .filter(rule => !omit.includes(rule.name))
  .concat([
    UniqueTypeNamesWithoutEnumsOrScalars,
    MatchingEnums,
    PossibleTypeExtensions,
  ]);
