import { IncomingMessage } from 'http';

export interface MicroRequest extends IncomingMessage {
  filePayload?: object;
}
