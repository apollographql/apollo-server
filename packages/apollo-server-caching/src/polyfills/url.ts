declare namespace NodeJS {
  interface Global {
    URL: typeof URL;
    URLSearchParams: typeof URLSearchParams;
  }
}

if (!global.URL) {
  const { URL, URLSearchParams } = require('url');

  global.URL = URL;
  global.URLSearchParams = URLSearchParams;
}
