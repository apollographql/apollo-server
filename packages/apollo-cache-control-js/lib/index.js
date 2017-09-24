"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
class CacheControlExtension {
    constructor() {
        this.cacheControl = new CacheControl();
    }
    beforeField(source, args, context, info) {
        const targetType = graphql_1.getNamedType(info.returnType);
        if (targetType instanceof graphql_1.GraphQLObjectType && targetType.astNode) {
            const hint = cacheHintFromDirectives(targetType.astNode.directives);
            if (hint) {
                this.cacheControl.addHint(info.path, hint);
            }
        }
        const parentType = info.parentType;
        if (parentType instanceof graphql_1.GraphQLObjectType) {
            const fieldDef = parentType.getFields()[info.fieldName];
            if (fieldDef.astNode) {
                const hint = cacheHintFromDirectives(fieldDef.astNode.directives);
                if (hint) {
                    this.cacheControl.addHint(info.path, hint);
                }
            }
        }
    }
    afterField(source, args, context, info) {
    }
    formatData() {
        return {
            cacheControl: {
                version: 1,
                hints: Array.from(this.cacheControl.hints).map(([path, hint]) => (Object.assign({ path: graphql_1.responsePathAsArray(path) }, hint)))
            }
        };
    }
}
exports.CacheControlExtension = CacheControlExtension;
function cacheHintFromDirectives(directives) {
    if (!directives)
        return undefined;
    const cacheControlDirective = directives.find(directive => directive.name.value === 'cacheControl');
    if (!cacheControlDirective)
        return undefined;
    if (!cacheControlDirective.arguments)
        return undefined;
    const maxAgeArgument = cacheControlDirective.arguments.find(argument => argument.name.value === 'maxAge');
    const scopeArgument = cacheControlDirective.arguments.find(argument => argument.name.value === 'scope');
    // TODO: Add proper typechecking of arguments
    return {
        maxAge: maxAgeArgument && maxAgeArgument.value && maxAgeArgument.value.kind === 'IntValue' ? parseInt(maxAgeArgument.value.value) : undefined,
        scope: scopeArgument && scopeArgument.value && scopeArgument.value.kind === 'EnumValue' ? scopeArgument.value.value : undefined
    };
}
class CacheControl {
    constructor() {
        this.hints = new Map();
    }
    addHint(path, hint) {
        const existingCacheHint = this.hints.get(path);
        if (existingCacheHint) {
            this.hints.set(path, {
                maxAge: Math.min(existingCacheHint.maxAge || 0, hint.maxAge || 0),
                scope: existingCacheHint.scope === CacheScope.Private || hint.scope === CacheScope.Private ? CacheScope.Private : CacheScope.Public
            });
        }
        else {
            this.hints.set(path, hint);
        }
    }
}
exports.CacheControl = CacheControl;
var CacheScope;
(function (CacheScope) {
    CacheScope["Public"] = "PUBLIC";
    CacheScope["Private"] = "PRIVATE";
})(CacheScope = exports.CacheScope || (exports.CacheScope = {}));
//# sourceMappingURL=index.js.map