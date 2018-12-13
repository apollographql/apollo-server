declare module 'graphql-upload' {
  import { GraphQLScalarType } from 'graphql';

  export const GraphQLUpload: GraphQLScalarType;

  export interface ApolloUploadOptions {
    /**
     * Max allowed non-file multipart form field size in bytes; enough for your queries (default: 1 MB)
     */
    maxFieldSize?: number;
    /**
     * Max allowed file size in bytes (default: Infinity)
     */
    maxFileSize?: number;
    /**
     * Max allowed number of files (default: Infinity)
     */
    maxFiles?: number;
  }

  export type Request = any;

  export type Response = any;

  export function processRequest(
    request: Request,
    response: Response,
    options?: ApolloUploadOptions,
  ): Promise<any>;
}
