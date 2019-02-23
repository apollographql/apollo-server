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
    // NOTE: Typings are wrong here (says the first param is `res`)
    res.onData((ab, isLast) => {
      // console.log(ab)
      // console.log(typeof ab)
      let chunk = Buffer.from(ab as any);
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
  })
}

