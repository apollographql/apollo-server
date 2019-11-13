/*
 *
 * This is largely a fork of printSchema from graphql-js with added support for
 * federation directives. The default printSchema includes all directive
 * *definitions* but doesn't include any directive *usages*. This version strips
 * federation directive definitions (which will be the same in every federated
 * schema), but keeps all their usages (so the gateway can process them).
 *
 */

import {
  DEFAULT_DEPRECATION_REASON,
  GraphQLArgument,
  GraphQLDirective,
  GraphQLEnumType,
  GraphQLEnumValue,
  GraphQLField,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
  astFromValue,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isIntrospectionType,
  isObjectType,
  isScalarType,
  isSpecifiedScalarType,
  isUnionType,
  print,
  specifiedDirectives,
} from 'graphql';
import federationDirectives, { gatherDirectives } from '../directives';
import { isFederationType } from '../types';

// Federation change: treat the directives defined by the federation spec
// similarly to the directives defined by the GraphQL spec (ie, don't print
// their definitions).
function isSpecifiedDirective(directive: GraphQLDirective): boolean {
  return [...specifiedDirectives, ...federationDirectives].some(
    specifiedDirective => specifiedDirective.name === directive.name,
  );
}

// Federation change: treat the types defined by the federation spec
// similarly to the directives defined by the GraphQL spec (ie, don't print
// their definitions).
function isDefinedType(type: GraphQLNamedType | GraphQLScalarType): boolean {
  return (
    !isSpecifiedScalarType(type as GraphQLScalarType) &&
    !isIntrospectionType(type) &&
    !isFederationType(type)
  );
}

export function printSchema(schema: GraphQLSchema): string {
  const directives = schema
    .getDirectives()
    .filter(n => !isSpecifiedDirective(n));
  const typeMap = schema.getTypeMap();
  const types = Object.values(typeMap)
    .sort((type1, type2) => type1.name.localeCompare(type2.name))
    .filter(isDefinedType);

  return (
    [printSchemaDefinition(schema)]
      .concat(
        directives.map(directive => printDirective(directive)),
        types.map(type => printType(type)),
      )
      .filter(Boolean)
      .join('\n\n') + '\n'
  );
}

/*
 * below is directly copied from graphql-js with some minor modifications
 */
function printSchemaDefinition(schema: GraphQLSchema): string | undefined {
  if (isSchemaOfCommonNames(schema)) {
    return;
  }

  const operationTypes = [];

  const queryType = schema.getQueryType();
  if (queryType) {
    operationTypes.push(`  query: ${queryType.name}`);
  }

  const mutationType = schema.getMutationType();
  if (mutationType) {
    operationTypes.push(`  mutation: ${mutationType.name}`);
  }

  const subscriptionType = schema.getSubscriptionType();
  if (subscriptionType) {
    operationTypes.push(`  subscription: ${subscriptionType.name}`);
  }

  return `schema {\n${operationTypes.join('\n')}\n}`;
}

/**
 * GraphQL schema define root types for each type of operation. These types are
 * the same as any other type and can be named in any manner, however there is
 * a common naming convention:
 *
 *   schema {
 *     query: Query
 *     mutation: Mutation
 *   }
 *
 * When using this naming convention, the schema description can be omitted.
 */
function isSchemaOfCommonNames(schema: GraphQLSchema): boolean {
  const queryType = schema.getQueryType();
  if (queryType && queryType.name !== 'Query') {
    return false;
  }

  const mutationType = schema.getMutationType();
  if (mutationType && mutationType.name !== 'Mutation') {
    return false;
  }

  const subscriptionType = schema.getSubscriptionType();
  if (subscriptionType && subscriptionType.name !== 'Subscription') {
    return false;
  }

  return true;
}

function printType(type: GraphQLNamedType): string {
  if (isScalarType(type)) {
    return printScalar(type);
  } else if (isObjectType(type)) {
    return printObject(type);
  } else if (isInterfaceType(type)) {
    return printInterface(type);
  } else if (isUnionType(type)) {
    return printUnion(type);
  } else if (isEnumType(type)) {
    return printEnum(type);
  } else if (isInputObjectType(type)) {
    return printInputObject(type);
  }

  // Not reachable. All possible types have been considered.
  /* istanbul ignore next */
  throw new Error(`Unexpected type: "${type}".`);
}

function printScalar(type: GraphQLScalarType): string {
  return printDescription(type) + `scalar ${type.name}`;
}

// Federation change: *do* print the usages of federation directives.
function printFederationDirectives(
  type: GraphQLNamedType | GraphQLField<any, any>,
): string {
  if (!type.astNode) return '';
  if (isInputObjectType(type)) return '';
  const directives = gatherDirectives(type)
    .filter(n =>
      federationDirectives.some(fedDir => fedDir.name === n.name.value),
    )
    .map(print)
    .join(' ');

  return directives.length > 0 ? ' ' + directives : '';
}

function printObject(type: GraphQLObjectType): string {
  const interfaces = type.getInterfaces();
  // Federation change: print `extend` keyword on type extensions.
  //
  // The implementation assumes that an owned type will have fields defined
  // since that is required for a valid schema. Types that are *only*
  // extensions will not have fields on the astNode since that ast doesn't
  // exist.
  //
  // XXX revist extension checking
  const isExtension =
    type.extensionASTNodes && type.astNode && !type.astNode.fields;
  const implementedInterfaces = interfaces.length
    ? ' implements ' + interfaces.map(i => i.name).join(' & ')
    : '';
  return (
    printDescription(type) +
    `${isExtension ? 'extend ' : ''}type ${
      type.name
    }${implementedInterfaces}${printFederationDirectives(type)}` +
    printFields(type)
  );
}

function printInterface(type: GraphQLInterfaceType): string {
  // Federation change: print `extend` keyword on type extensions.
  // See printObject for assumptions made.
  //
  // XXX revist extension checking
  const isExtension =
    type.extensionASTNodes && type.astNode && !type.astNode.fields;
  return (
    printDescription(type) +
    `${isExtension ? 'extend ' : ''}interface ${
      type.name
    }${printFederationDirectives(type)}` +
    printFields(type)
  );
}

function printUnion(type: GraphQLUnionType): string {
  const types = type.getTypes();
  const possibleTypes = types.length ? ' = ' + types.join(' | ') : '';
  return printDescription(type) + 'union ' + type.name + possibleTypes;
}

function printEnum(type: GraphQLEnumType): string {
  const values = type
    .getValues()
    .map(
      value =>
        printDescription(value, '  ') +
        '  ' +
        value.name +
        printDeprecated(value),
    );

  return printDescription(type) + `enum ${type.name}` + printBlock(values);
}

function printInputObject(type: GraphQLInputObjectType): string {
  const fields = Object.values(type.getFields()).map(
    f => printDescription(f, '  ') + '  ' + printInputValue(f),
  );
  return printDescription(type) + `input ${type.name}` + printBlock(fields);
}

function printFields(
  type: GraphQLInterfaceType | GraphQLObjectType | GraphQLInputObjectType,
) {
  const fields = Object.values(type.getFields()).map(
    f =>
      printDescription(f, '  ') +
      '  ' +
      f.name +
      printArgs(f.args, '  ') +
      ': ' +
      String(f.type) +
      printDeprecated(f) +
      // Federation change: print usages of federation directives.
      printFederationDirectives(f),
  );
  return printBlock(fields);
}

function printBlock(items: string[]) {
  return items.length !== 0 ? ' {\n' + items.join('\n') + '\n}' : '';
}

function printArgs(args: GraphQLArgument[], indentation = '') {
  if (args.length === 0) {
    return '';
  }

  // If every arg does not have a description, print them on one line.
  if (args.every(arg => !arg.description)) {
    return '(' + args.map(printInputValue).join(', ') + ')';
  }

  return (
    '(\n' +
    args
      .map(
        arg =>
          printDescription(arg, '  ' + indentation) +
          '  ' +
          indentation +
          printInputValue(arg),
      )
      .join('\n') +
    '\n' +
    indentation +
    ')'
  );
}

function printInputValue(arg: GraphQLInputField | GraphQLArgument) {
  const defaultAST = astFromValue(arg.defaultValue, arg.type);
  let argDecl = arg.name + ': ' + String(arg.type);
  if (defaultAST) {
    argDecl += ` = ${print(defaultAST)}`;
  }
  return argDecl;
}

function printDirective(directive: GraphQLDirective) {
  return (
    printDescription(directive) +
    'directive @' +
    directive.name +
    printArgs(directive.args) +
    ' on ' +
    directive.locations.join(' | ')
  );
}

function printDeprecated(
  fieldOrEnumVal: GraphQLField<any, any> | GraphQLEnumValue,
) {
  if (!fieldOrEnumVal.isDeprecated) {
    return '';
  }
  const reason = fieldOrEnumVal.deprecationReason;
  const reasonAST = astFromValue(reason, GraphQLString);
  if (reasonAST && reason !== '' && reason !== DEFAULT_DEPRECATION_REASON) {
    return ' @deprecated(reason: ' + print(reasonAST) + ')';
  }
  return ' @deprecated';
}

function printDescription(
  def:
    | GraphQLArgument
    | GraphQLDirective
    | GraphQLEnumType
    | GraphQLField<any, any>
    | GraphQLInputField
    | GraphQLInputObjectType
    | GraphQLInterfaceType
    | GraphQLNamedType
    | GraphQLEnumValue
    | GraphQLUnionType,
  indentation: string = '',
): string {
  if (!def.description) {
    return '';
  }

  const lines = descriptionLines(def.description, 120 - indentation.length);
  if (lines.length === 1) {
    return indentation + `"${lines[0]}"\n`;
  } else {
    return (
      indentation + ['"""', ...lines, '"""'].join('\n' + indentation) + '\n'
    );
  }
}

function descriptionLines(description: string, maxLen: number): Array<string> {
  const rawLines = description.split('\n');
  return rawLines.flatMap(line => {
    if (line.length < maxLen + 5) {
      return line;
    }
    // For > 120 character long lines, cut at space boundaries into sublines
    // of ~80 chars.
    return breakLine(line, maxLen);
  });
}

function breakLine(line: string, maxLen: number): Array<string> {
  const parts = line.split(new RegExp(`((?: |^).{15,${maxLen - 40}}(?= |$))`));
  if (parts.length < 4) {
    return [line];
  }
  const sublines = [parts[0] + parts[1] + parts[2]];
  for (let i = 3; i < parts.length; i += 2) {
    sublines.push(parts[i].slice(1) + parts[i + 1]);
  }
  return sublines;
}
