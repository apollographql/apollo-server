const IORedis = jest.genMockFromModule('ioredis');

const keyValue = {};

const deleteKey = key => {
  delete keyValue[key];
  return Promise.resolve(true);
};

const getKey = key => {
  if (keyValue[key]) {
    return Promise.resolve(keyValue[key].value);
  }

  return Promise.resolve(undefined);
};

const mGetKey = (key, cb) => getKey(key).then(val => [val]);

const setKey = (key, value, type, ttl) => {
  keyValue[key] = {
    value,
    ttl,
  };
  if (ttl) {
    setTimeout(() => {
      delete keyValue[key];
    }, ttl * 1000);
  }
  return Promise.resolve(true);
};

IORedis.prototype.del.mockImplementation(deleteKey);
IORedis.prototype.get.mockImplementation(getKey);
IORedis.prototype.mget.mockImplementation(mGetKey);
IORedis.prototype.set.mockImplementation(setKey);

export default IORedis;
