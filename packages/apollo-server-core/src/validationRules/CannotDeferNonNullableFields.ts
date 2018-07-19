import {
  ValidationContext,
  ASTVisitor,
  GraphQLError,
  isNonNullType,
} from 'graphql';

export function cannotDeferOnNonNullMessage(fieldName: string): string {
  return `@defer cannot be applied on non-nullable field "${fieldName}".`;
}

export function CannotDeferNonNullableFields(
  context: ValidationContext,
): ASTVisitor {
  return {
    Directive(node, key, parent, path, ancestors) {
      const fieldDef = context.getFieldDef();
      if (node.name.value === 'defer' && isNonNullType(fieldDef.type)) {
        context.reportError(
          new GraphQLError(
            cannotDeferOnNonNullMessage(
              `${context.getParentType()}.${fieldDef.name}`,
            ),
            [node],
          ),
        );
      }
      return;
    },
  };
}
