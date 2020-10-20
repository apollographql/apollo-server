import {
  EnumTypeStat,
  EnumValueStat,
  IEnumValueStat,
  IInputFieldStat,
  InputFieldStat,
  InputTypeStat,
  Trace
} from 'apollo-reporting-protobuf';
import { VariableValues } from 'apollo-server-types';
import {
  DocumentNode,
  EnumValueNode,
  getNamedType,
  GraphQLInputType,
  GraphQLSchema,
  GraphQLType,
  isEnumType,
  isInputObjectType,
  isInputType,
  isListType,
  isNonNullType,
  isScalarType,
  ObjectFieldNode,
  ObjectValueNode,
  OperationDefinitionNode,
  separateOperations,
  typeFromAST,
  TypeInfo,
  visit,
  visitWithTypeInfo
} from "graphql";
import { isCollection, forEach } from 'iterall';

// We would like to inform users about what schema changes are safe, specifically:
// - Can an input object field be safely removed?
// - Can an input object field's default value be safely removed?
// - Can an input object field's type be safely changed to non-nullable? Will
//   this require the addition of a default value?
// - Can an enum value be safely removed?
//
// To give this insight, we need to know whether an operation is using a given
// enum value or input object field (and whether it supplies null at least once
// for that field, and similarily whether it supplies undefined at least once
// for that field). This isn't extractable from a given operation signature,
// since signatures hide literals and don't include variable structure (as this
// information can be highly dynamic and/or sensitive). So for each request, we
// summarize just the data we need and add it to the trace.
export function addTraceRequestStats({
  trace,
  schema,
  document,
  operation,
  variables,
}: {
  trace: Pick<Trace, 'perEnumTypeStat' | 'perInputTypeStat'>;
  schema: GraphQLSchema;
  document: DocumentNode;
  operation: OperationDefinitionNode;
  variables?: VariableValues;
}): void {
  try {
    // Search the variable values for input object fields and enum values. This
    // code is adapted from coerceVariableValues() in graphql-js.
    //
    // Note that we need to keep track of which variables evalulate to null and
    // undefined, for cases where an input value in the operation body contains
    // an input object field that is set to a variable.
    const nullVariableNames = new Set<string>();
    const undefinedVariableNames = new Set<string>();
    for (const varDefinition of operation.variableDefinitions ?? []) {
      const varName = varDefinition.variable.name.value;

      // TS unfortunately doesn't handle overloads and union types as nicely as
      // Flow, see https://github.com/microsoft/TypeScript/issues/14107
      let varType: GraphQLType | undefined;
      switch (varDefinition.type.kind) {
        case 'ListType':
          varType = typeFromAST(schema, varDefinition.type);
          break;
        case 'NamedType':
          varType = typeFromAST(schema, varDefinition.type);
          break;
        case 'NonNullType':
          varType = typeFromAST(schema, varDefinition.type);
          break;
      }

      if (!varType || !isInputType(varType)) {
        throw Error('Variable type must be input type.');
      }

      if (!variables || !Object.prototype.hasOwnProperty.call(variables, varName)) {
        if (!varDefinition.defaultValue && isNonNullType(varType)) {
          throw Error('Non-null variable with no default must have value provided.');
        }
        if (!varDefinition.defaultValue) {
          undefinedVariableNames.add(varName)
        } else if (varDefinition.defaultValue.kind === 'NullValue') {
          nullVariableNames.add(varName);
        }
        continue;
      }

      const value = variables[varName];
      if (value === null) {
        if (isNonNullType(varType)) {
          throw Error('Non-null variable cannot be provided null value.');
        }
        nullVariableNames.add(varName);
      }

      addTraceInputValueStats({
        trace,
        inputValue: value,
        inputType: varType,
      });
    }

    // Search the operation body for input object fields and enum values. Note
    // that isn't just the operation definition's AST, but also any used
    // fragment ASTs.
    const operationDocument = separateOperations(document)[
      operation.name?.value ?? ''
    ];
    const typeInfo = new TypeInfo(schema);
    visit(operationDocument, visitWithTypeInfo(typeInfo, {
      ObjectValue(node: ObjectValueNode): void {
        // The operation has been successfully validated by this stage, so the
        // non-null assertions here are fine. Look at the Kind.OBJECT_FIELD case
        // in TypeInfo.enter() in graphql-js, and notice that there's no case
        // for case for Kind.OBJECT_VALUE for enter/leave. This means that
        // getInputType() here must return the input object type.
        const inputType = typeInfo.getInputType()!;
        const inputObjectType = getNamedType(inputType);

        if (isInputObjectType(inputObjectType)) {
          const inputFields = inputObjectType.getFields();
          const operationInputFields = new Set<string>(
            node.fields.map((inputFieldNode) => inputFieldNode.name.value)
          );

          for (const inputField of Object.values(inputFields)) {
            if (!operationInputFields.has(inputField.name)) {
              inputFieldIsUsedByRequest({
                trace,
                inputObjectTypeName: inputObjectType.name,
                inputFieldName: inputField.name,
                inputFieldTypeName: inputField.type.toString(),
                isPresent: false,
                isNull: false,
                isUndefined: true,
              });
            }
          }
        } else {
          // Similar to the non-null assertion above, this shouldn't happen.
          throw Error('Unexpected input type.');
        }
      },
      ObjectField(node: ObjectFieldNode): void {
        // The operation has been successfully validated by this stage, so the
        // non-null assertions here are fine. Look at the Kind.OBJECT_FIELD case
        // in TypeInfo.enter() in graphql-js for why this works.
        const parentInputType = typeInfo.getParentInputType()!;
        const inputType = typeInfo.getInputType()!;

        // For fields that have variable values, we need to check the variable's
        // coerced value to see whether null/undefined has been provided. Note
        // that there's an annoying edge case in spec surrounding permissible
        // variable values in the last section of
        // https://spec.graphql.org/June2018/#sec-All-Variable-Usages-are-Allowed
        //
        // Specifically, a variable with nullable type can be the value of an
        // input object field of non-nullable type provided that at least one of
        // either the variable or field has a default value (and that value is
        // not null). In this case, if the variable is passed an explicit null,
        // execution will fail for that field. However, it's possible that the
        // field is never executed, e.g. due to being in a fragment that's never
        // executed.
        //
        // So we don't consider the request invalid in this case. We instead
        // consider this particular usage as the field being present and provided
        // null. This is because:
        // - Schema changes to remove this input field will make this request
        //   always fail instead of sometimes (hence why we consider it present).
        // - Schema changes to change the field's type from nullable to
        //   non-nullable won't care about these stats, since the field's type
        //   in this case is non-nullable. At first glance, it might seem like
        //   we'd want to avoid saying the field is provided null when its type
        //   is non-nullable because it might be confusing. But this just avoids
        //   the truth about an ugly edge case in spec. More importantly, with
        //   this information, we can let users know when their requests are
        //   doing this, as it may be unintentional on their part.
        inputFieldIsUsedByRequest({
          trace,
          inputObjectTypeName: getNamedType(parentInputType).name,
          inputFieldName: node.name.value,
          inputFieldTypeName: inputType.toString(),
          isPresent: true,
          isNull: node.value.kind === 'NullValue' || (
            node.value.kind === 'Variable' &&
            nullVariableNames.has(node.value.name.value)
          ),
          isUndefined: node.value.kind === 'Variable' &&
            undefinedVariableNames.has(node.value.name.value),
        });
      },
      EnumValue(node: EnumValueNode): void {
        // The operation has been successfully validated by this stage, so the
        // non-null assertion here is fine. Look at the Kind.ENUM case in
        // TypeInfo.enter() in graphql-js for why this works.
        const inputType = typeInfo.getInputType()!;
        enumValueIsPresentInRequest({
          trace,
          enumTypeName: getNamedType(inputType).name,
          enumValueName: node.value,
        });
      },
    }));
  } catch (_) {
    // At the stage of AS when this is run, variables have not been validated
    // yet, and accordingly the code that traverses variables may throw. In
    // those cases, we consider the request itself as invalid. Since the point
    // of collecting these stats is to understand how schema changes affect
    // valid operation executions, we collect no stats for invalid requests.
    trace.perInputTypeStat = Object.create(null);
    trace.perEnumTypeStat = Object.create(null);
  }
}

// This code is adapted from coerceInputValue() in graphql-js. Note that we
// validate the variables here in addition to collecting stats, as we don't
// want to collect stats for invalid requests.
function addTraceInputValueStats({
  trace,
  inputValue,
  inputType,
}: {
  trace: Pick<Trace, 'perEnumTypeStat' | 'perInputTypeStat'>;
  inputValue: any;
  inputType: GraphQLInputType;
}): void {
  if (isNonNullType(inputType)) {
    if (inputValue !== null) {
      addTraceInputValueStats({
        trace,
        inputValue,
        inputType: inputType.ofType,
      })
      return;
    }
    throw Error('Non-null type cannot be provided null value.');
  }

  // Provided null for nullable type.
  if (inputValue === null) return;

  if (isListType(inputType)) {
    const itemType = inputType.ofType;
    if (isCollection(inputValue)) {
      const iterator = (itemValue: any) => {
        addTraceInputValueStats({
          trace,
          inputValue: itemValue,
          inputType: itemType,
        });
      }
      // TS unfortunately doesn't handle overloads and union types as nicely as
      // Flow, see https://github.com/microsoft/TypeScript/issues/14107
      if ('length' in inputValue) {
        forEach(inputValue, iterator);
      } else {
        forEach(inputValue, iterator);
      }
    } else {
      // Lists accept a non-list value as a list of one.
      addTraceInputValueStats({
        trace,
        inputValue,
        inputType: itemType,
      });
    }
    return;
  }

  if (isInputObjectType(inputType)) {
    if (typeof inputValue !== 'object') {
      throw Error('Input object type must be provided object value.');
    }
    const inputFields = inputType.getFields();

    for (const inputField of Object.values(inputFields)) {
      const inputFieldValue = inputValue[inputField.name];

      if (inputFieldValue === undefined) {
        if (inputField.defaultValue === undefined && isNonNullType(inputField.type)) {
          throw Error('Non-null input field with no default must have value provided.');
        }
        inputFieldIsUsedByRequest({
          trace,
          inputObjectTypeName: inputType.name,
          inputFieldName: inputField.name,
          inputFieldTypeName: inputField.type.toString(),
          isPresent: false,
          isNull: false,
          isUndefined: true,
        });
        continue;
      }

      inputFieldIsUsedByRequest({
        trace,
        inputObjectTypeName: inputType.name,
        inputFieldName: inputField.name,
        inputFieldTypeName: inputField.type.toString(),
        isPresent: true,
        isNull: inputFieldValue === null,
        isUndefined: false,
      });

      addTraceInputValueStats({
        trace,
        inputValue: inputFieldValue,
        inputType: inputField.type,
      });
    }

    // Ensure every provided field is defined.
    for (const fieldName of Object.keys(inputValue)) {
      if (!inputFields[fieldName]) {
        throw Error('Input object type does not have provided field name.');
      }
    }
    return;
  }

  if (isScalarType(inputType)) {
    let parseResult;

    // Scalars determine if an input value is valid via parseValue(), which can
    // throw to indicate failure.
    try {
      parseResult = inputType.parseValue(inputValue);
    } catch (error) {
      throw Error('Scalar type threw while parsing provided value.');
    }
    if (parseResult === undefined) {
      throw Error('Scalar type returned undefined when parsing provided value.');
    }
    return;
  }

  if (isEnumType(inputType)) {
    if (typeof inputValue === 'string') {
      const enumValue = inputType.getValue(inputValue);
      if (enumValue) {
        enumValueIsPresentInRequest({
          trace,
          enumTypeName: inputType.name,
          enumValueName: enumValue.name,
        });
        return;
      }
    }
    throw Error('Enum type does not have provided enum value.');
  }

  // Not reachable. All possible input types have been considered.
  throw Error('Unexpected input type.');
}

function inputFieldIsUsedByRequest({
  trace,
  inputObjectTypeName,
  inputFieldName,
  inputFieldTypeName,
  isPresent,
  isNull,
  isUndefined,
}: {
  trace: Pick<Trace, 'perInputTypeStat'>;
  inputObjectTypeName: string;
  inputFieldName: string;
  inputFieldTypeName: string;
  isPresent: boolean;
  isNull: boolean;
  isUndefined: boolean;
}): void {
  const inputTypeStat =
    Object.prototype.hasOwnProperty.call(trace.perInputTypeStat, inputObjectTypeName)
      ? trace.perInputTypeStat[inputObjectTypeName]
      : (trace.perInputTypeStat[inputObjectTypeName] = new InputTypeStat());
  const perInputFieldStat = inputTypeStat.perInputFieldStat
    ?? (inputTypeStat.perInputFieldStat = Object.create(null));
  const inputFieldStat: IInputFieldStat =
    Object.prototype.hasOwnProperty.call(perInputFieldStat, inputFieldName)
      ? perInputFieldStat[inputFieldName]
      : (perInputFieldStat[inputFieldName] = new InputFieldStat());
  inputFieldStat.fieldType = inputFieldTypeName;
  if (isPresent) inputFieldStat.requestCount = 1;
  if (isNull) inputFieldStat.requestCountNull = 1;
  if (isUndefined) inputFieldStat.requestCountUndefined = 1;
}

function enumValueIsPresentInRequest({
  trace,
  enumTypeName,
  enumValueName,
}: {
  trace: Pick<Trace, 'perEnumTypeStat'>;
  enumTypeName: string;
  enumValueName: string;
}): void {
  const enumTypeStat =
    Object.prototype.hasOwnProperty.call(trace.perEnumTypeStat, enumTypeName)
      ? trace.perEnumTypeStat[enumTypeName]
      : (trace.perEnumTypeStat[enumTypeName] = new EnumTypeStat());
  const perEnumValueStat = enumTypeStat.perEnumValueStat
    ?? (enumTypeStat.perEnumValueStat = Object.create(null));
  const enumValueStat: IEnumValueStat =
    Object.prototype.hasOwnProperty.call(perEnumValueStat, enumValueName)
      ? perEnumValueStat[enumValueName]
      : (perEnumValueStat[enumValueName] = new EnumValueStat());
  enumValueStat.requestCount = 1;
}
