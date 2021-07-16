// FIXME license, credits

import http from 'http';
import https from 'https';
import type { Socket } from 'net';

export function stoppable(server: http.Server, grace?: number) {
  const realGrace = typeof grace === 'undefined' ? Infinity : grace;
  const reqsPerSocket = new Map<Socket, number>();
  let stopped = false;
  let gracefully = true;

  if (server instanceof https.Server) {
    server.on('secureConnection', onConnection);
  } else {
    server.on('connection', onConnection);
  }

  server.on('request', onRequest);
  // FIXME make Promisey
  const stop = (
    callback: (e: Error | undefined, gracefully: Boolean) => void,
  ) => {
    // allow request handlers to update state before we act on that state
    setImmediate(() => {
      stopped = true;
      if (realGrace < Infinity) {
        // FIXME don't do unref
        setTimeout(destroyAll, realGrace).unref();
      }
      server.close((e) => {
        if (callback) {
          callback(e, gracefully);
        }
      });
      reqsPerSocket.forEach(endIfIdle);
    });
  };

  // FIXME return function instead of augmenting
  (server as any).stop = stop;
  return server;

  function onConnection(socket: Socket) {
    reqsPerSocket.set(socket, 0);
    socket.once('close', () => reqsPerSocket.delete(socket));
  }

  function onRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    reqsPerSocket.set(req.socket, (reqsPerSocket.get(req.socket) ?? 0) + 1);
    res.once('finish', () => {
      const pending = (reqsPerSocket.get(req.socket) ?? 0) - 1;
      reqsPerSocket.set(req.socket, pending);
      if (stopped && pending === 0) {
        req.socket.end();
      }
    });
  }

  function endIfIdle(requests: number, socket: Socket) {
    if (requests === 0) socket.end();
  }

  function destroyAll() {
    gracefully = false;
    reqsPerSocket.forEach((_, socket) => socket.end());
    setImmediate(() => {
      reqsPerSocket.forEach((_, socket) => socket.destroy());
    });
  }
}
