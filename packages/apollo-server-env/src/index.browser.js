if (!global) {
  global = self;
}

let { fetch, Request, Response, Headers, URL, URLSearchParams } = global;
fetch = fetch.bind(global);
export { fetch, Request, Response, Headers, URL, URLSearchParams };

if (!global.process) {
  global.process = {};
}

if (!global.process.env) {
  global.process.env = {
    // app is a global available on fly.io
    NODE_ENV: typeof app !== 'undefined' ? app.env : 'production',
  };
}

if (!global.process.version) {
  global.process.version = '';
}

if (!global.process.hrtime) {
  // Adapted from https://github.com/kumavis/browser-process-hrtime
  global.process.hrtime = function hrtime(previousTimestamp) {
    var clocktime = Date.now() * 1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime % 1) * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds, nanoseconds];
  };
}

if (!global.os) {
  // TODO: Add some sensible values
  global.os = {};
}
