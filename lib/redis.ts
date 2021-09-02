import redis from "redis";
import { promisify } from "util";
import { requireEnv } from "./env";

const redisClient = redis.createClient({ url: requireEnv("REDIS_URL") });

export const getAsync = promisify(redisClient.get).bind(redisClient);
export const setAsync = promisify(redisClient.set).bind(redisClient);
