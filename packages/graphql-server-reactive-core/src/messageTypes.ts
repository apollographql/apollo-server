import { ExecutionResult } from 'graphql';
export const RGQL_MSG_ERROR    = 'error';
export const RGQL_MSG_COMPLETE = 'complete';
export const RGQL_MSG_DATA     = 'data';
export const RGQL_MSG_START    = 'start';
export const RGQL_MSG_STOP     = 'stop';
export type RGQLMessageType   = (
    'error'    |
    'complete' |
    'data'     |
    'start'    |
    'stop'
);
export type RGQLPayloadError = Error;
export type RGQLPayloadData = ExecutionResult;
export interface RGQLPayloadStart {
  query?: string;
  variables?: any;
  operationName?: string;
};
export type RGQLPayloadType = RGQLPayloadError | RGQLPayloadData | RGQLPayloadStart;
