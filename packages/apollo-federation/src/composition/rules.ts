import { specifiedSDLRules } from 'graphql/validation/specifiedRules';

import {
  UniqueTypeNamesWithFields,
  MatchingEnums,
  PossibleTypeExtensions,
  UniqueFieldDefinitionNames,
  UniqueUnionTypes,
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
    UniqueTypeNamesWithFields,
    MatchingEnums,
    UniqueUnionTypes,
    PossibleTypeExtensions,
  ]);
