import { Trace } from "apollo-reporting-protobuf";
import { addTraceRequestStats } from "../addTraceRequestStats";
import { VariableValues } from "apollo-server-types";
import { buildASTSchema, getOperationAST, parse, validate } from "graphql";

describe('Input object field and enum value stats tests', () => {
  function runTest({
    schema,
    operation,
    operationName,
    variables,
    perEnumTypeStat = {},
    perInputTypeStat = {},
  }: {
    schema: string;
    operation: string;
    operationName?: string;
    variables?: VariableValues;
    perEnumTypeStat?: {
      [enumTypeName: string]: {
        [enumValueName: string]: {
          requestCount?: number;
        }
      }
    };
    perInputTypeStat?: {
      [inputObjectTypeName: string]: {
        [inputFieldName: string]: {
          fieldType: string;
          requestCount?: number;
          requestCountNull?: number;
          requestCountUndefined?: number;
        }
      }
    }
  }) {
    const trace = new Trace();
    const graphqlSchema = buildASTSchema(parse(schema));
    const documentAST = parse(operation);
    const validationErrors = validate(graphqlSchema, documentAST);
    if (validationErrors.length) {
      throw Error(`Operation document is invalid: ${
        validationErrors.map((e) => e.message).join(', ')
      }`);
    }
    const operationAST = getOperationAST(parse(operation), operationName);
    if (!operationAST) throw Error('Could not get operation from document.');
    addTraceRequestStats({
      trace,
      schema: graphqlSchema,
      document: documentAST,
      operation: operationAST,
      variables,
    })
    expect(trace.perEnumTypeStat).toEqual(
      Object.entries(perEnumTypeStat).map(
        ([typeName, perEnumValueStat]) => ({
          key: typeName,
          value: { perEnumValueStat, }
        })
      ).reduce((output, {key, value}) => {
        output[key] = value
        return output;
      }, Object.create(null))
    );
    expect(trace.perInputTypeStat).toEqual(
      Object.entries(perInputTypeStat).map(
        ([typeName, perInputFieldStat]) => ({
          key: typeName,
          value: { perInputFieldStat, }
        })
      ).reduce((output, {key, value}) => {
        output[key] = value
        return output;
      }, Object.create(null))
    );
  };

  describe('basic examples', () => {
    const basicSchema = `
      type Query {
        foo(input: TestInput, enum: TestEnum): String!
      }

      directive @bar(input: TestInput, enum: TestEnum) on FIELD

      enum TestEnum {
        VALUE
      }

      input TestInput {
        field: String
      }
    `;

    describe.each([
      ['input field is provided non-null value', false, ''],
      ['input field is provided null value', false, null],
      ['input field is undefined', false, undefined],
      ['enum value', true, 'VALUE'],
    ])(
      '%s',
      (_, isEnumValue: boolean, value: string | null| undefined) => {
        const basicTraceStats = isEnumValue
          ? {
              perEnumTypeStat: {
                TestEnum: {
                  [value!]: {
                    requestCount: 1,
                  },
                },
              },
            }
          : value === undefined
          ? {
              perInputTypeStat: {
                TestInput: {
                  field: {
                    fieldType: 'String',
                    requestCountUndefined: 1,
                  },
                },
              },
            }
          : value === null
          ? {
              perInputTypeStat: {
                TestInput: {
                  field: {
                    fieldType: 'String',
                    requestCount: 1,
                    requestCountNull: 1,
                  },
                },
              },
            }
          : {
              perInputTypeStat: {
                TestInput: {
                  field: {
                    fieldType: 'String',
                    requestCount: 1,
                  },
                },
              },
            };
        const basicValue = isEnumValue
          ? value
          : value === undefined
          ? '{}'
          : value === null
          ? '{ field: null }'
          : `{ field: "${value}" }`
        const basicArg = `${isEnumValue ? 'enum' : 'input'}: ${basicValue}`;

        it('object field argument usage', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query {
                foo(${basicArg})
              }
            `,
            ...basicTraceStats,
          });
        });

        it('object field argument usage with alias', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query {
                bar: foo(${basicArg})
              }
            `,
            ...basicTraceStats,
          });
        });

        it('object field argument usage in inline fragment', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query {
                ... on Query {
                  foo(${basicArg})
                }
              }
            `,
            ...basicTraceStats,
          });
        });

        it('object field argument usage in named fragment', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query Foo {
                ...Bar
              }

              fragment Bar on Query {
                foo(${basicArg})
              }
            `,
            ...basicTraceStats,
          });
        });

        it('object field argument usage in unused operation', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query Foo {
                __typename
              }

              query Unused {
                foo(${basicArg})
              }
            `,
            operationName: 'Foo',
          });
        });

        it('object field argument usage in unused named fragment', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query Foo {
                __typename
              }

              query Unused {
                ...UnusedFragment
              }

              fragment UnusedFragment on Query {
                foo(${basicArg})
              }
            `,
            operationName: 'Foo',
          });
        });

        it('directive argument usage', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query {
                foo @bar(${basicArg})
              }
            `,
            ...basicTraceStats,
          });
        });

        const basicVarDefinitionWithDefault =
          `$var: ${isEnumValue ? 'TestEnum' : 'TestInput'} = ${basicValue}`;
        const basicVarArg =
          `${isEnumValue ? 'enum' : 'input'}: $var`

        it('default variable usage', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query(${basicVarDefinitionWithDefault}) {
                foo(${basicVarArg})
              }
            `,
            ...basicTraceStats,
          });
        });

        it('default variable usage in unused operation', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query Foo {
                __typename
              }

              query Unused(${basicVarDefinitionWithDefault}) {
                foo(${basicVarArg})
              }
            `,
            operationName: 'Foo',
          });
        });

        const basicVarDefinition =
          `$var: ${isEnumValue ? 'TestEnum' : 'TestInput'}`;
        const basicVariables = {
          var: isEnumValue
            ? value
            : value === undefined
            ? {}
            : { field: value },
        };

        it('direct variable usage', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query(${basicVarDefinition}) {
                foo(${basicVarArg})
              }
            `,
            variables: basicVariables,
            ...basicTraceStats,
          });
        });

        it('invalid variables', () => {
          runTest({
            schema: basicSchema,
            operation: `
              query($badInput: TestInput) {
                foo1: foo(${basicArg})
                fooBad: foo(input: $badInput)
              }
            `,
            variables: {
              badInput: { notField: '' },
            },
          });
        });
      },
    );

    describe('input field\'s value is variable', () => {
      describe.each([
        ['variable is provided non-null value', ''],
        ['variable is provided null value', null],
        ['variable is undefined', undefined],
      ])(
        '%s',
        (_, value: string | null | undefined) => {
          const basicVariables = value === undefined ? {} : { var: value };

          it('input field and variable types compatible', () => {
            runTest({
              schema: basicSchema,
              operation: `
                query($var: String) {
                  foo(input: { field: $var })
                }
              `,
              variables: basicVariables,
              perInputTypeStat: {
                TestInput: {
                  field: {
                    fieldType: 'String',
                    requestCount: 1,
                    ...(value === undefined
                      ? { requestCountUndefined: 1 }
                      : value === null
                      ? { requestCountNull: 1 }
                      : {}
                    ),
                  },
                },
              },
            });
          });

          describe('input field is non-nullable and variable is nullable', () => {
            // This is to test a particularly annoying edge case in spec, see
            // the last section of
            // https://spec.graphql.org/June2018/#sec-All-Variable-Usages-are-Allowed
            test.each([[false, true], [true, false], [true, true]])(
              'input field has default: %s, variable has default: %s',
              (fieldHasDefault: boolean, variableHasDefault: boolean) => {
                const edgeCaseSchema = `
                  type Query {
                    foo(input: TestInput): String!
                  }

                  input TestInput {
                    field: String! ${fieldHasDefault ? '= "field default"': ''}
                  }
                `;
                const edgeCaseOperation = `
                  query(
                    $var: String ${variableHasDefault ? ' = "var default"' : ''}
                  ) {
                    foo(input: { field: $var })
                  }
                `;

                runTest({
                  schema: edgeCaseSchema,
                  operation: edgeCaseOperation,
                  variables: basicVariables,
                  perInputTypeStat: {
                    TestInput: {
                      field: {
                        fieldType: 'String!',
                        requestCount: 1,
                        ...(value === undefined && !variableHasDefault
                          ? { requestCountUndefined: 1 }
                          : value === null
                          ? { requestCountNull: 1 }
                          : {}
                        ),
                      },
                    },
                  },
                });
              },
            );
          });
        },
      );
    });
  });

  describe('complex examples', () => {
    it('many types', () => {
      runTest({
        schema: `
          type Query {
            foo: Foo
          }

          type Foo {
            bar(
              arg1: EnumType1
              arg2: InputType1
              arg3: InputType2
              arg4: InputType4
            ): String
          }

          input InputType1 {
            field1: [String]!
            field2: Int
          }

          input InputType2 {
            field3: EnumType2!
            field4: Boolean
          }

          input InputType3 {
            field5: EnumType3!
            field6: EnumType4
          }

          input InputType4 {
            field7: InputType3!
            field8: InputType4
          }

          enum EnumType1 {
            VALUE_1
            VALUE_2
          }

          enum EnumType2 {
            VALUE_3
            VALUE_4
          }

          enum EnumType3 {
            VALUE_5
            VALUE_6
          }

          enum EnumType4 {
            VALUE_7
            VALUE_8
          }
        `,
        operation: `
          query($var1: Int, $var2: InputType2, $var3: InputType4) {
            foo {
              bar(
                arg1: VALUE_2
                arg2: {
                  field1: [""]
                  field2: $var1
                }
                arg3: $var2
                arg4: {
                  field7: {
                    field5: VALUE_5
                  }
                  field8: $var3
                }
              )
            }
          }
        `,
        variables: {
          var1: 0,
          var2: {
            field3: 'VALUE_3',
          },
          var3: {
            field7: {
              field5: 'VALUE_6',
              field6: null,
            },
            field8: null,
          },
        },
        perEnumTypeStat: {
          EnumType1: {
            VALUE_2: {
              requestCount: 1,
            },
          },
          EnumType2: {
            VALUE_3: {
              requestCount: 1,
            },
          },
          EnumType3: {
            VALUE_5: {
              requestCount: 1,
            },
            VALUE_6: {
              requestCount: 1,
            },
          },
        },
        perInputTypeStat: {
          InputType1: {
            field1: {
              fieldType: '[String]!',
              requestCount: 1,
            },
            field2: {
              fieldType: 'Int',
              requestCount: 1,
            },
          },
          InputType2: {
            field3: {
              fieldType: 'EnumType2!',
              requestCount: 1,
            },
            field4: {
              fieldType: 'Boolean',
              requestCountUndefined: 1,
            },
          },
          InputType3: {
            field5: {
              fieldType: 'EnumType3!',
              requestCount: 1,
            },
            field6: {
              fieldType: 'EnumType4',
              requestCount: 1,
              requestCountNull: 1,
              requestCountUndefined: 1,
            },
          },
          InputType4: {
            field7: {
              fieldType: 'InputType3!',
              requestCount: 1,
            },
            field8: {
              fieldType: 'InputType4',
              requestCount: 1,
              requestCountNull: 1,
            },
          },
        },
      });
    });
  });
});
