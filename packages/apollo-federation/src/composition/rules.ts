import { specifiedSDLRules } from 'graphql/validation/specifiedRules';

import {
  UniqueTypeNamesWithoutEnumsOrScalars,
  MatchingEnums,
  PossibleTypeExtensions,
  UniqueFieldDefinitionNames,
} from './validate/sdl';

const omit = [
  'UniqueDirectivesPerLocation',
  'UniqueTypeNames',
  'UniqueEnumValueNames',
  'PossibleTypeExtensions',
  'UniqueFieldDefinitionNames',
];

export const compositionRules = specifiedSDLRules
  .filter(rule => !omit.includes(rule.name))
  .concat([
    UniqueFieldDefinitionNames,
    UniqueTypeNamesWithoutEnumsOrScalars,
    MatchingEnums,
    PossibleTypeExtensions,
  ]);
