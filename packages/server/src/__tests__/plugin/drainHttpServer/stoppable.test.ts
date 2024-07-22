// This file is adapted from the stoppable npm package:
// https://github.com/hunterloftis/stoppable
//
// We've ported it to TypeScript and made some further changes.
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

import http from 'http';
import https from 'https';
const a: any = require('awaiting');
const request: any = require('requisition');
import fs from 'fs';
import { Stopper } from '../../../plugin/drainHttpServer/stoppable';
import path from 'path';
import type { AddressInfo } from 'net';
import { describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { AbortController } from 'node-abort-controller';
import resolvable, { Resolvable } from '../../../utils/resolvable.js';

function port(s: http.Server) {
  return (s.address() as AddressInfo).port;
}

interface SchemeInfo {
  agent: (opts?: http.AgentOptions) => http.Agent;
  server: (handler?: http.RequestListener) => http.Server;
}

const agents: http.Agent[] = [];
afterEach(() => {
  agents.forEach((a) => a.destroy());
  agents.length = 0;
});

const schemes: Record<string, SchemeInfo> = {
  http: {
    agent: (opts = {}) => {
      const a = new http.Agent(opts);
      agents.push(a);
      return a;
    },
    server: (handler) =>
      http.createServer(handler || ((_req, res) => res.end('hello'))),
  },
  https: {
    agent: (opts = {}) => {
      const a = new https.Agent(
        Object.assign({ rejectUnauthorized: false }, opts),
      );
      agents.push(a);
      return a;
    },
    server: (handler) =>
      https.createServer(
        {
          key: fs.readFileSync(
            path.join(__dirname, 'stoppable', 'fixture.key'),
          ),
          cert: fs.readFileSync(
            path.join(__dirname, 'stoppable', 'fixture.cert'),
          ),
        },
        handler || ((_req, res) => res.end('hello')),
      ),
  },
};

Object.keys(schemes).forEach((schemeName) => {
  const scheme = schemes[schemeName];

  describe(`${schemeName}.Server`, function () {
    describe('.close()', () => {
      let server: http.Server;

      beforeEach(function () {
        server = scheme.server();
      });

      it('without keep-alive connections', async () => {
        let closed = 0;
        server.on('close', () => closed++);
        server.listen(0);
        const p = port(server);
        await a.event(server, 'listening');
        const res1 = await request(`${schemeName}://localhost:${p}`).agent(
          scheme.agent(),
        );
        const text1 = await res1.text();
        expect(text1).toBe('hello');
        server.close();
        const err = await a.failure(
          request(`${schemeName}://localhost:${p}`).agent(scheme.agent()),
        );
        expect(err.code).toMatch(/ECONNREFUSED/);
        expect(closed).toBe(1);
      });

      it('with keep-alive connections', async () => {
        let closed = 0;

        server.on('close', () => closed++);
        server.listen(0);
        const p = port(server);
        await a.event(server, 'listening');
        const res1 = await request(`${schemeName}://localhost:${p}`).agent(
          scheme.agent({ keepAlive: true }),
        );
        const text1 = await res1.text();
        expect(text1).toBe('hello');
        server.close();
        const err = await a.failure(
          request(`${schemeName}://localhost:${p}`).agent(
            scheme.agent({ keepAlive: true }),
          ),
        );
        expect(err.code).toMatch(/ECONNREFUSED/);

        // Node 19 (http) and 20.4+ (https) more aggressively close idle
        // connections. `Stopper` is no longer needed for the purpose of closing
        // idle connections in these versions. However, `Stopper` _is_ still
        // useful for gracefully finishing in-flight requests within the timeout
        // (and aborting requests beyond the timeout).
        const isNode20orGreater = !!process.version.match(/^v2\d\./);
        expect(closed).toBe(isNode20orGreater ? 1 : 0);
      });

      // This test specifically added for Node 20 fails for Node 14. Just going
      // to skip it since we're dropping Node 14 soon anyway.
      const node14 = !!process.version.match(/^v14\./);
      (node14 ? it.skip : it)(
        'with unfinished requests',
        async () => {
          const server = scheme.server(async (_req, res) => {
            res.writeHead(200);
            res.write('hi'); // note lack of end()!
          });
          // The server will prevent itself from closing while the connection
          // remains open (default no timeout). This will close the connection
          // after 100ms so the test can finish.
          server.setTimeout(100);

          server.listen(0);
          const p = port(server);

          const response = await request(
            `${schemeName}://localhost:${p}`,
          ).agent(scheme.agent({ keepAlive: true }));
          // ensure we got the headers, etc.
          expect(response.status).toBe(200);

          server.close();
          await a.event(server, 'close');

          try {
            await response.text();
          } catch (e: any) {
            expect(e.code).toMatch(/ECONNRESET/);
          }
          // ensure the expectation in the catch block is reached (+ the one above)
          expect.assertions(2);
        },
        35000,
      );
    });

    describe('Stopper', function () {
      it('without keep-alive connections', async () => {
        let closed = 0;
        const server = scheme.server();
        const stopper = new Stopper(server);

        server.on('close', () => closed++);
        server.listen(0);
        const p = port(server);
        await a.event(server, 'listening');
        const res1 = await request(`${schemeName}://localhost:${p}`).agent(
          scheme.agent(),
        );
        const text1 = await res1.text();
        expect(text1).toBe('hello');
        const gracefully = await stopper.stop();
        const err = await a.failure(
          request(`${schemeName}://localhost:${p}`).agent(scheme.agent()),
        );
        expect(err.code).toMatch(/ECONNREFUSED/);

        expect(closed).toBe(1);
        expect(gracefully).toBe(true);
      });

      it('with idle keep-alive connections', async () => {
        let closed = 0;
        const server = scheme.server();
        const stopper = new Stopper(server);

        server.on('close', () => closed++);
        server.listen(0);
        const p = port(server);
        await a.event(server, 'listening');
        const res1 = await request(`${schemeName}://localhost:${p}`).agent(
          scheme.agent({ keepAlive: true }),
        );
        const text1 = await res1.text();
        expect(text1).toBe('hello');
        const gracefully = await stopper.stop();
        const err = await a.failure(
          request(`${schemeName}://localhost:${p}`).agent(
            scheme.agent({ keepAlive: true }),
          ),
        );
        expect(err.code).toMatch(/ECONNREFUSED/);

        expect(closed).toBe(1);
        expect(gracefully).toBe(true);

        expect(stopper['requestCountPerSocket'].size).toBe(0);
      });
    });

    it('with unfinished requests', async () => {
      const server = scheme.server((_req, res) => {
        res.writeHead(200);
        res.write('hi'); // note lack of end()!
      });
      const stopper = new Stopper(server);
      server.listen(0);
      const p = port(server);
      await a.event(server, 'listening');
      // Send two requests and wait to receive headers.
      await Promise.all([
        request(`${schemeName}://localhost:${p}`).agent(
          scheme.agent({ keepAlive: true }),
        ),
        request(`${schemeName}://localhost:${p}`).agent(
          scheme.agent({ keepAlive: true }),
        ),
      ]);
      let closeCalled: boolean = false;
      const closeEventPromise = a.event(server, 'close').then(() => {
        closeCalled = true;
      });
      const abortController = new AbortController();
      let gracefully: boolean | null = null;
      const stopPromise = stopper
        .stop(abortController.signal)
        .then((stopReturn) => {
          gracefully = stopReturn;
        });

      // Wait a while (number chosen here is arbitrary). Stopping should not have happened yet.
      await a.delay(500);
      expect(closeCalled).toBe(false);
      expect(gracefully).toBeNull();

      // Now abort it; this should be sufficient for the two promises above to
      // resolve.
      abortController.abort();
      await stopPromise;
      await closeEventPromise;
      expect(closeCalled).toBe(true);
      expect(gracefully).toBe(false);
      // It takes a moment for the `finish` events to happen. Loop waiting for
      // them to finish and update this data structure (if it never happens,
      // we'll get a Jest timeout, which is the failure we want).
      while (stopper['requestCountPerSocket'].size > 0) {
        await a.delay(20);
      }
    });

    it('with requests in-flight', async () => {
      const barriers: Record<string, Resolvable<void>> = {
        b250: resolvable(),
        b500: resolvable(),
      };
      const server = scheme.server((req, res) => {
        res.writeHead(200);
        res.write('hello');
        barriers[req.url!.slice(1)].then(() => res.end('world'));
      });
      const stopper = new Stopper(server);

      server.listen(0);
      const p = port(server);
      await a.event(server, 'listening');
      const res = await Promise.all([
        request(`${schemeName}://localhost:${p}/b250`).agent(
          scheme.agent({ keepAlive: true }),
        ),
        request(`${schemeName}://localhost:${p}/b500`).agent(
          scheme.agent({ keepAlive: true }),
        ),
      ]);
      let closeCalled: boolean = false;
      const closeEventPromise = a.event(server, 'close').then(() => {
        closeCalled = true;
      });
      let gracefully: boolean | null = null;
      const stopPromise = stopper.stop().then((stopReturn) => {
        gracefully = stopReturn;
      });

      // Wait a while. Stopping should not have happened yet,
      await a.delay(250);
      expect(closeCalled).toBe(false);
      expect(gracefully).toBeNull();

      // Let the first request resolve and wait a bit more. Stopping should
      // still not have happened.
      barriers.b250.resolve();
      await a.delay(250);
      expect(closeCalled).toBe(false);
      expect(gracefully).toBeNull();

      // Let the second request resolve. Then things should stop properly.
      barriers.b500.resolve();
      await closeEventPromise;
      await stopPromise;
      expect(closeCalled).toBe(true);
      expect(gracefully).toBe(true);

      const bodies = await Promise.all(res.map((r) => r.text()));
      expect(bodies).toStrictEqual(['helloworld', 'helloworld']);
    });

    if (schemeName === 'http') {
      it('with in-flights finishing before grace period ends', async () => {
        let stopper: Stopper;
        const killServerBarrier = resolvable();
        const server = http.createServer(async (_, res) => {
          res.writeHead(200);
          res.write('hello');

          await killServerBarrier;
          res.end('world');
          await stopper.stop();
        });
        stopper = new Stopper(server);
        server.listen(0);
        const p = port(server);

        const res = await request(`${schemeName}://localhost:${p}/`).agent(
          scheme.agent({ keepAlive: true }),
        );
        let gotBody = false;
        const bodyPromise = res.text().then((body: string) => {
          gotBody = true;
          return body;
        });

        // Wait a while. We shouldn't have finished reading the response yet.
        await a.delay(250);
        expect(gotBody).toBe(false);

        // Tell the server that its request should finish.
        killServerBarrier.resolve();

        const body = await bodyPromise;
        expect(gotBody).toBe(true);
        expect(body).toBe('helloworld');

        // Wait for server to close.
        await a.event(server, 'close');
      });
    }
  });
});
