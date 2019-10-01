import { specifiedSDLRules } from 'graphql/validation/specifiedRules';

/**
 * Since this module has overlapping names in the two modules (graphql-js and
 * our own, local validation rules) which we are importing from, we
 * intentionally are very explicit about the suffixes of imported members here,
 * so that the intention is clear.
 *
 * First, we'll import validation rules from graphql-js which we'll omit and
 * replace with our own validation rules. As noted above, we'll use aliases
 * with 'FromGraphqlJs' suffixes for clarity.
 */

import {
  UniqueDirectivesPerLocation as UniqueDirectivesPerLocationFromGraphqlJs,
} from 'graphql/validation/rules/UniqueDirectivesPerLocation';
import {
  UniqueTypeNames as UniqueTypeNamesFromGraphqlJs,
} from 'graphql/validation/rules/UniqueTypeNames';
import {
  UniqueEnumValueNames as UniqueEnumValueNamesFromGraphqlJs,
} from 'graphql/validation/rules/UniqueEnumValueNames';
import {
  PossibleTypeExtensions as PossibleTypeExtensionsFromGraphqlJs,
} from 'graphql/validation/rules/PossibleTypeExtensions';
import {
  UniqueFieldDefinitionNames as UniqueFieldDefinitionNamesFromGraphqlJs,
} from 'graphql/validation/rules/UniqueFieldDefinitionNames';

/**
 * Then, we'll import our own validation rules to take the place of those that
 * we'll be customizing, taking care to alias them all to the same name with
 * "FromComposition" suffixes.
 */
import {
  UniqueTypeNamesWithFields as UniqueTypeNamesWithFieldsFromComposition,
  MatchingEnums as MatchingEnumsFromComposition,
  PossibleTypeExtensions as PossibleTypeExtensionsFromComposition,
  UniqueFieldDefinitionNames as UniqueFieldDefinitionsNamesFromComposition,
  UniqueUnionTypes as UniqueUnionTypesFromComposition,
 } from './validate/sdl';

const omit = [
  UniqueDirectivesPerLocationFromGraphqlJs,
  UniqueTypeNamesFromGraphqlJs,
  UniqueEnumValueNamesFromGraphqlJs,
  PossibleTypeExtensionsFromGraphqlJs,
  UniqueFieldDefinitionNamesFromGraphqlJs,
];

export const compositionRules = specifiedSDLRules
  .filter(rule => !omit.includes(rule))
  .concat([
    UniqueFieldDefinitionsNamesFromComposition,
    UniqueTypeNamesWithFieldsFromComposition,
    MatchingEnumsFromComposition,
    UniqueUnionTypesFromComposition,
    PossibleTypeExtensionsFromComposition,
  ]);
