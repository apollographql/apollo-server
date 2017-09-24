import { GraphQLResolveInfo, ResponsePath } from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';
export declare class CacheControlExtension<TContext = any> implements GraphQLExtension<TContext> {
    cacheControl: CacheControl;
    beforeField(source: any, args: {
        [argName: string]: any;
    }, context: TContext, info: GraphQLResolveInfo): void;
    afterField(source: any, args: {
        [argName: string]: any;
    }, context: TContext, info: GraphQLResolveInfo): void;
    formatData(): {
        cacheControl: {
            version: number;
            hints: {
                maxAge?: number | undefined;
                scope?: CacheScope | undefined;
                path: (string | number)[];
            }[];
        };
    };
}
export declare class CacheControl {
    hints: Map<ResponsePath, CacheHint>;
    constructor();
    addHint(path: ResponsePath, hint: CacheHint): void;
}
export interface CacheHint {
    maxAge?: number;
    scope?: CacheScope;
}
export declare enum CacheScope {
    Public = "PUBLIC",
    Private = "PRIVATE",
}
