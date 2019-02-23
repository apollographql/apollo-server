import { HttpResponse } from 'uWebSockets.js'

// Utility function used to set multiple headers on a response object.
export function setHeaders(res: HttpResponse, headers: Object): void {
  Object.keys(headers).forEach((header: string) => {
    res.writeHeader(header, headers[header]);
  });
}

export function json(res: HttpResponse) {
  return new Promise((resolve, reject) => {
    let buffer;

    // Register data cb
    res.onData((res, ab, isLast) => {
      let chunk = Buffer.from(ab);
      if (isLast) {
        let json;
        if (buffer) {
          try {
            json = JSON.parse(Buffer.concat([buffer, chunk]).toString());
          } catch (e) {
            /* res.close calls onAborted */
            res.close();
            return reject(e)
          }
          resolve(json);
        } else {
          try {
            json = JSON.parse(chunk.toString());
          } catch (e) {
            /* res.close calls onAborted */
            res.close();
            return reject(e)
          }
          resolve(json);
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
    });

    /* (REQUIRED) Register error cb */
    res.onAborted(() => {
      /* Request was prematurely aborted or invalid or missing, stop reading */
      console.log('Invalid JSON or no data at all!');
    });
  })
}

