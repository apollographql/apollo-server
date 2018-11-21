import {
  DirectiveNode,
  getNamedType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLResolveInfo,
  ResponsePath,
  responsePathAsArray,
} from 'graphql';

import { GraphQLExtension, GraphQLResponse } from 'graphql-extensions';

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
  Private = 'PRIVATE',
}

export interface CacheControlExtensionOptions {
  defaultMaxAge?: number;
  // FIXME: We should replace these with
  // more appropriately named options.
  calculateHttpHeaders?: boolean;
  stripFormattedExtensions?: boolean;
}

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: {
      setCacheHint: (hint: CacheHint) => void;
      cacheHint: CacheHint;
    };
  }
}

export class CacheControlExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  private defaultMaxAge: number;

  constructor(public options: CacheControlExtensionOptions = {}) {
    this.defaultMaxAge = options.defaultMaxAge || 0;
  }

  private hints: Map<ResponsePath, CacheHint> = new Map();

  willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ) {
    let hint: CacheHint = {};

    // If this field's resolver returns an object or interface, look for hints
    // on that return type.
    const targetType = getNamedType(info.returnType);
    if (
      targetType instanceof GraphQLObjectType ||
      targetType instanceof GraphQLInterfaceType
    ) {
      if (targetType.astNode) {
        hint = mergeHints(
          hint,
          cacheHintFromDirectives(targetType.astNode.directives),
        );
      }
    }

    // If this field is a field on an object, look for hints on the field
    // itself, taking precedence over previously calculated hints.
    const parentType = info.parentType;
    if (parentType instanceof GraphQLObjectType) {
      const fieldDef = parentType.getFields()[info.fieldName];
      if (fieldDef.astNode) {
        hint = mergeHints(
          hint,
          cacheHintFromDirectives(fieldDef.astNode.directives),
        );
      }
    }

    // If this resolver returns an object and we haven't seen an explicit maxAge
    // hint, set the maxAge to 0 (uncached) or the default if specified in the
    // constructor.  (Non-object fields by default are assumed to inherit their
    // cacheability from their parents.)
    if (
      (targetType instanceof GraphQLObjectType ||
        targetType instanceof GraphQLInterfaceType) &&
      hint.maxAge === undefined
    ) {
      hint.maxAge = this.defaultMaxAge;
    }

    if (hint.maxAge !== undefined || hint.scope !== undefined) {
      this.addHint(info.path, hint);
    }

    info.cacheControl = {
      setCacheHint: (hint: CacheHint) => {
        this.addHint(info.path, hint);
      },
      cacheHint: hint,
    };
  }

  addHint(path: ResponsePath, hint: CacheHint) {
    const existingCacheHint = this.hints.get(path);
    if (existingCacheHint) {
      this.hints.set(path, mergeHints(existingCacheHint, hint));
    } else {
      this.hints.set(path, hint);
    }
  }

  format(): [string, CacheControlFormat] | undefined {
    if (this.options.stripFormattedExtensions) return;

    return [
      'cacheControl',
      {
        version: 1,
        hints: Array.from(this.hints).map(([path, hint]) => ({
          path: [...responsePathAsArray(path)],
          ...hint,
        })),
      },
    ];
  }

  public willSendResponse?(o: { graphqlResponse: GraphQLResponse }) {
    if (this.options.calculateHttpHeaders && o.graphqlResponse.http) {
      const overallCachePolicy = this.computeOverallCachePolicy();

      if (overallCachePolicy) {
        o.graphqlResponse.http.headers.set(
          'Cache-Control',
          `max-age=${
            overallCachePolicy.maxAge
          }, ${overallCachePolicy.scope.toLowerCase()}`,
        );
      }
    }
  }

  computeOverallCachePolicy(): Required<CacheHint> | undefined {
    let lowestMaxAge: number | undefined = undefined;
    let scope: CacheScope = CacheScope.Public;

    for (const hint of this.hints.values()) {
      if (hint.maxAge) {
        lowestMaxAge = lowestMaxAge
          ? Math.min(lowestMaxAge, hint.maxAge)
          : hint.maxAge;
      }
      if (hint.scope === CacheScope.Private) {
        scope = CacheScope.Private;
      }
    }

    return lowestMaxAge
      ? {
          maxAge: lowestMaxAge,
          scope,
        }
      : undefined;
  }
}

function cacheHintFromDirectives(
  directives: ReadonlyArray<DirectiveNode> | undefined,
): CacheHint | undefined {
  if (!directives) return undefined;

  const cacheControlDirective = directives.find(
    directive => directive.name.value === 'cacheControl',
  );
  if (!cacheControlDirective) return undefined;

  if (!cacheControlDirective.arguments) return undefined;

  const maxAgeArgument = cacheControlDirective.arguments.find(
    argument => argument.name.value === 'maxAge',
  );
  const scopeArgument = cacheControlDirective.arguments.find(
    argument => argument.name.value === 'scope',
  );

  // TODO: Add proper typechecking of arguments
  return {
    maxAge:
      maxAgeArgument &&
      maxAgeArgument.value &&
      maxAgeArgument.value.kind === 'IntValue'
        ? parseInt(maxAgeArgument.value.value)
        : undefined,
    scope:
      scopeArgument &&
      scopeArgument.value &&
      scopeArgument.value.kind === 'EnumValue'
        ? (scopeArgument.value.value as CacheScope)
        : undefined,
  };
}

function mergeHints(
  hint: CacheHint,
  otherHint: CacheHint | undefined,
): CacheHint {
  if (!otherHint) return hint;

  return {
    maxAge: otherHint.maxAge !== undefined ? otherHint.maxAge : hint.maxAge,
    scope: otherHint.scope || hint.scope,
  };
}
