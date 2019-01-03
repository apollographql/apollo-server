import {
  ValidationContext,
  ASTVisitor,
  GraphQLError,
  isNonNullType,
  DirectiveNode,
} from 'graphql';

export function cannotDeferOnNonNullMessage(fieldName: string): string {
  return `@defer cannot be applied on non-nullable field "${fieldName}".`;
}

export function CannotDeferNonNullableFields(
  context: ValidationContext,
): ASTVisitor {
  return {
    Directive(node: DirectiveNode) {
      const fieldDef = context.getFieldDef();
      if (fieldDef) {
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
      }
    },
  };
}
