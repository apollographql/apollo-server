import {
  DirectiveNode,
  getNamedType,
  GraphQLObjectType,
  GraphQLResolveInfo,
  ResponsePath,
  responsePathAsArray
} from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';

export interface CacheControlFormat {
  version: 1;
  hints: {
    path: (string | number)[];
    maxAge?: number;
    scope?: CacheScope;
  }[];
}

export class CacheControlExtension<TContext = any> implements GraphQLExtension<TContext> {
  cacheControl = new CacheControl();

  beforeField(_source: any, _args: { [argName: string]: any }, _context: TContext, info: GraphQLResolveInfo) {
    let hint: CacheHint = {};

    const targetType = getNamedType(info.returnType);
    if (targetType instanceof GraphQLObjectType) {
      if (targetType.astNode) {
        hint = mergeHints(hint, cacheHintFromDirectives(targetType.astNode.directives));
      }
    }

    const parentType = info.parentType;
    if (parentType instanceof GraphQLObjectType) {
      const fieldDef = parentType.getFields()[info.fieldName];
      if (fieldDef.astNode) {
        hint = mergeHints(hint, cacheHintFromDirectives(fieldDef.astNode.directives));
      }
    }

    if (targetType instanceof GraphQLObjectType && hint.maxAge === undefined) {
      hint.maxAge = 0;
    }

    if (hint.maxAge !== undefined || hint.scope !== undefined) {
      this.cacheControl.addHint(info.path, hint);
    }
  }

  setCacheHint(_hint: CacheHint) {
    // this.cacheControl.addHint(info.path, hint);
  }

  afterField(_source: any, _args: { [argName: string]: any }, _context: TContext, _info: GraphQLResolveInfo) {}

  formatData(): CacheControlFormat {
    return {
      version: 1,
      hints: Array.from(this.cacheControl.hints).map(([path, hint]) => ({
        path: responsePathAsArray(path),
        ...hint
      }))
    };
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
    maxAge:
      maxAgeArgument && maxAgeArgument.value && maxAgeArgument.value.kind === 'IntValue'
        ? parseInt(maxAgeArgument.value.value)
        : undefined,
    scope:
      scopeArgument && scopeArgument.value && scopeArgument.value.kind === 'EnumValue'
        ? scopeArgument.value.value as CacheScope
        : undefined
  };
}

function mergeHints(hint: CacheHint, otherHint: CacheHint | undefined): CacheHint {
  if (!otherHint) return hint;

  const maxAges = [hint.maxAge, otherHint.maxAge].filter(x => x) as number[];

  return {
    maxAge: maxAges.length > 0 ? Math.min(...maxAges) : undefined,
    scope:
      hint.scope === CacheScope.Private || otherHint.scope === CacheScope.Private
        ? CacheScope.Private
        : hint.scope || otherHint.scope
  };
}

export class CacheControl {
  hints: Map<ResponsePath, CacheHint> = new Map();

  constructor() {}

  addHint(path: ResponsePath, hint: CacheHint) {
    const existingCacheHint = this.hints.get(path);
    if (existingCacheHint) {
      this.hints.set(path, mergeHints(existingCacheHint, hint));
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
