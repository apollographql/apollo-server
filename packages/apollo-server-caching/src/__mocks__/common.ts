export const servers = {
  memcachedHost: process.env.MEMCACHED_HOST || 'localhost:11211',
  redisHost: process.env.REDIS_HOST || 'localhost',
};

export const delay = ms => new Promise(res => setTimeout(res, ms));
