// This server is run by a test in stoppable.test.js. Its HTTP server should
// only ever get one request. It will respond with a 200 and start writing its
// body and then start the Stopper process with no hard-destroy grace period. It
// will finish the request on SIGUSR1.

import http from 'http';
import { Stopper } from '../../../../../dist/esm/plugin/drainHttpServer/stoppable.js';

let stopper;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.write('hello');
  process.on('SIGUSR1', () => res.end('world'));
  stopper.stop();
});
stopper = new Stopper(server);
server.listen(0, () => console.log(server.address().port));
