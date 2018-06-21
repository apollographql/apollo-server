const RealDate = global.Date;

export function mockDate() {
  global.Date = new Proxy(RealDate, handler);
}

export function unmockDate() {
  global.Date = RealDate;
}

let now = Date.now();

export function advanceTimeBy(ms: number) {
  now += ms;
}

const handler: ProxyHandler<any> = {
  construct(target, args) {
    if (args.length === 0) {
      return new Date(now);
    } else {
      return new target(...args);
    }
  },
  get(target, propKey) {
    if (propKey === 'now') {
      return () => now;
    } else {
      return target[propKey];
    }
  },
};
