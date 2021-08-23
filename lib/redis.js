/* eslint-disable @typescript-eslint/no-var-requires */
const redis = require("redis");
const { promisify } = require("util");
const redisClient = redis.createClient();

module.exports = {
  getAsync: promisify(redisClient.get).bind(redisClient),
  setAsync: promisify(redisClient.set).bind(redisClient),
};
