import { DirectiveNode, getNamedType, GraphQLObjectType, GraphQLResolveInfo, ResponsePath, responsePathAsArray } from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';

export class CacheControlExtension<TContext = any> implements GraphQLExtension<TContext> {
  cacheControl = new CacheControl();

  beforeField(source: any, args: { [argName: string]: any }, context: TContext, info: GraphQLResolveInfo) {
    const targetType = getNamedType(info.returnType);
    if (targetType instanceof GraphQLObjectType && targetType.astNode) {
      const hint = cacheHintFromDirectives(targetType.astNode.directives);
      if (hint) {
        this.cacheControl.addHint(info.path, hint);
      }
    }

    const parentType = info.parentType;
    if (parentType instanceof GraphQLObjectType) {
      const fieldDef = parentType.getFields()[info.fieldName];
      if (fieldDef.astNode) {
        const hint = cacheHintFromDirectives(fieldDef.astNode.directives);
        if (hint) {
          this.cacheControl.addHint(info.path, hint);
        }
      }
    }
  }

  afterField(source: any, args: { [argName: string]: any }, context: TContext, info: GraphQLResolveInfo) {
  }

  formatData() {
    return {
      cacheControl: {
        version: 1,
        hints: Array.from(this.cacheControl.hints).map(([path, hint]) => ({
          path: responsePathAsArray(path),
          ...hint
        }))
      }
    }
  }
}

function cacheHintFromDirectives(directives: DirectiveNode[] | undefined): CacheHint | undefined {
  if (!directives) return undefined;

  const cacheControlDirective = directives.find(directive => directive.name.value === 'cacheControl');
  if (!cacheControlDirective) return undefined;

  if (!cacheControlDirective.arguments) return undefined;

  const maxAgeArgument = cacheControlDirective.arguments.find(argument => argument.name.value === 'maxAge');
  const scopeArgument = cacheControlDirective.arguments.find(argument => argument.name.value === 'scope');

  // TODO: Add proper typechecking of arguments
  return {
    maxAge: maxAgeArgument && maxAgeArgument.value && maxAgeArgument.value.kind === 'IntValue' ? parseInt(maxAgeArgument.value.value) : undefined,
    scope: scopeArgument && scopeArgument.value && scopeArgument.value.kind === 'EnumValue' ? scopeArgument.value.value as CacheScope : undefined
  }
}

export class CacheControl {
  hints: Map<ResponsePath, CacheHint> = new Map();

  constructor() {}

  addHint(path: ResponsePath, hint: CacheHint) {
    const existingCacheHint = this.hints.get(path);
    if (existingCacheHint) {
      this.hints.set(path, {
        maxAge: Math.min(existingCacheHint.maxAge || 0, hint.maxAge || 0),
        scope: existingCacheHint.scope === CacheScope.Private || hint.scope === CacheScope.Private ? CacheScope.Private : CacheScope.Public
      });
    } else {
      this.hints.set(path, hint);
    }
  }
}

export interface CacheHint {
  maxAge?: number;
  scope?: CacheScope;
}

export enum CacheScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}
