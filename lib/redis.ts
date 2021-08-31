import redis from "redis";
import { promisify } from "util";

const redisClient = redis.createClient();

export const getAsync = promisify(redisClient.get).bind(redisClient);
export const setAsync = promisify(redisClient.set).bind(redisClient);
