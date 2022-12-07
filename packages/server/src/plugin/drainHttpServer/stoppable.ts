// This file is adapted from the stoppable npm package:
// https://github.com/hunterloftis/stoppable
//
// We've ported it to TypeScript and simplified the API and fixed some bugs.
// Here's the license of the original code:
//
// The MIT License (MIT)
//
// Copyright (c) 2017 Hunter Loftis <hunter@hunterloftis.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import type http from 'http';
import https from 'https';
import type { Socket } from 'net';
import type { AbortSignal } from 'node-abort-controller';

export class Stopper {
  private requestCountPerSocket = new Map<Socket, number>();
  private stopped = false;

  constructor(private server: http.Server | https.Server) {
    // Keep a number in requestCountPerSocket for each current connection.
    server.on(
      server instanceof https.Server ? 'secureConnection' : 'connection',
      (socket: Socket) => {
        this.requestCountPerSocket.set(socket, 0);
        socket.once('close', () => this.requestCountPerSocket.delete(socket));
      },
    );

    // Track how many HTTP requests are active on the socket.
    server.on(
      'request',
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        this.requestCountPerSocket.set(
          req.socket,
          (this.requestCountPerSocket.get(req.socket) ?? 0) + 1,
        );
        res.once('finish', () => {
          const pending = (this.requestCountPerSocket.get(req.socket) ?? 0) - 1;
          this.requestCountPerSocket.set(req.socket, pending);
          // If we're in the process of stopping and it's gone idle, close the
          // socket.
          if (this.stopped && pending === 0) {
            req.socket.end();
          }
        });
      },
    );
  }

  async stop(hardDestroyAbortSignal?: AbortSignal): Promise<boolean> {
    let gracefully = true;

    // In the off-chance that we are calling `stop` directly from within the
    // HTTP server's request handler (and so we haven't gotten to the
    // `connection` event yet), wait a moment so that `connection` can be called
    // and this request can actually count.
    await new Promise<void>((resolve) => setImmediate(resolve));
    this.stopped = true;

    // When told to, hard-destroy everything.
    const onAbort = () => {
      gracefully = false;
      this.requestCountPerSocket.forEach((_, socket) => socket.end());
      // (FYI, this setImmediate was cargo-culted from the original
      // implementation, but we don't understand why it's here.)
      setImmediate(() => {
        this.requestCountPerSocket.forEach((_, socket) => socket.destroy());
      });
    };
    hardDestroyAbortSignal?.addEventListener('abort', onAbort);

    // Close the server and create a Promise that resolves when all connections
    // are closed. Note that we ignore any error from `close` here.
    const closePromise = new Promise<void>((resolve) =>
      this.server.close(() => {
        hardDestroyAbortSignal?.removeEventListener('abort', onAbort);
        resolve();
      }),
    );

    // Immediately close any idle sockets.
    this.requestCountPerSocket.forEach((requests, socket) => {
      if (requests === 0) socket.end();
    });

    // Wait for all connections to be closed.
    await closePromise;

    return gracefully;
  }
}
