import {
  DirectiveNode,
  getNamedType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLResolveInfo,
  ResponsePath,
  responsePathAsArray
} from 'graphql';

import { GraphQLExtension } from 'graphql-extensions';

export interface CacheControlFormat {
  version: 1;
  hints: ({ path: (string | number)[] } & CacheHint)[];
}

export interface CacheHint {
  maxAge?: number;
  scope?: CacheScope;
}

export enum CacheScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: {
      setCacheHint: (hint: CacheHint) => void
    };
  }
}

export class CacheControlExtension<TContext = any> implements GraphQLExtension<TContext> {
  constructor() {}

  private hints: Map<ResponsePath, CacheHint> = new Map();

  willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo
  ) {
    let hint: CacheHint = {};

    const targetType = getNamedType(info.returnType);
    if (targetType instanceof GraphQLObjectType
      || targetType instanceof GraphQLInterfaceType) {
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
      this.addHint(info.path, hint);
    }

    info.cacheControl = {
      setCacheHint: (hint: CacheHint) => {
        this.addHint(info.path, hint);
      }
    }
  }

  addHint(path: ResponsePath, hint: CacheHint) {
    const existingCacheHint = this.hints.get(path);
    if (existingCacheHint) {
      this.hints.set(path, mergeHints(existingCacheHint, hint));
    } else {
      this.hints.set(path, hint);
    }
  }

  format(): [string, CacheControlFormat] {
    return [
      'cacheControl',
      {
        version: 1,
        hints: Array.from(this.hints).map(([path, hint]) => ({
          path: responsePathAsArray(path),
          ...hint
        }))
      }
    ];
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

  return {
    maxAge: otherHint.maxAge || hint.maxAge,
    scope: otherHint.scope || hint.scope
  };
}
