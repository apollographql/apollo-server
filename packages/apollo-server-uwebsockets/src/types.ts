import { HttpRequest, HttpResponse } from 'uWebSockets.js'

// export interface MicroRequest extends IncomingMessage {
//   filePayload?: object;
// }

export type RequestHandler = (res: HttpResponse, req: HttpRequest) => Promise<void> | void
