import { HttpRequest, HttpResponse } from 'uWebSockets.js'

export type RequestHandler = (res: HttpResponse, req: HttpRequest) => Promise<void> | void
