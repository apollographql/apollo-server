import { ExecutionResult } from 'graphql';

// Refer to https://github.com/apollographql/graphql-server/issues/272#issuecomment-278805955 for more information about protocol
export const RGQL_MSG_ERROR        = 'error';
export const RGQL_MSG_COMPLETE     = 'complete';
export const RGQL_MSG_DATA         = 'data';
export const RGQL_MSG_START        = 'start';
export const RGQL_MSG_STOP         = 'stop';
export const RGQL_MSG_KEEPALIVE    = 'keepalive';
export const RGQL_MSG_INIT         = 'init';
export const RGQL_MSG_INIT_SUCCESS = 'init_success';
export type RGQLMessageType   = (
  'error'        |
  'complete'     |
  'data'         |
  'start'        |
  'stop'         |
  'keepalive'    |
  'init'         |
  'init_success'
);

export type RGQLPayloadError = Error;
export type RGQLPayloadData = ExecutionResult;
export interface RGQLPayloadStart {
  query?: string;
  variables?: any;
  operationName?: string;
};
export type RGQLPayloadType = RGQLPayloadError | RGQLPayloadData | RGQLPayloadStart;

export interface RGQLPacketData {
  id: number; // Per socket increasing number
  type: RGQLMessageType;
  payload: RGQLPayloadType;
}

export interface RGQLPacket {
  data: RGQLPacketData;
  metadata?: Object;
}
