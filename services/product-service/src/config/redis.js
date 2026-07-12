const { createClient } = require("redis");
require("dotenv").config();

const redisUrl =
  process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_CONNECT_TIMEOUT_MS = Number(
  process.env.REDIS_CONNECT_TIMEOUT_MS || 1000
);

const client = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: REDIS_CONNECT_TIMEOUT_MS
  }
});

client.on("error", (error) => {
  console.log("Redis error:", error.message);
});

let connectPromise;

const getClient = async () => {
  if (!connectPromise) {
    connectPromise = (async () => {
      try {
        const redisClient = await Promise.race([
          client.connect(),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  `Redis connection timeout after ${REDIS_CONNECT_TIMEOUT_MS}ms`
                )
              );
            }, REDIS_CONNECT_TIMEOUT_MS);
          })
        ]);

        console.log("Redis Connected");
        return redisClient;
      } catch (error) {
        console.log("Redis connection failed:", error.message);
        connectPromise = null;
        return null;
      }
    })();
  }

  return connectPromise;
};

const getCache = async (key) => {
  const redisClient = await getClient();

  if (!redisClient) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.log("Redis get failed:", error.message);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds) => {
  const redisClient = await getClient();

  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(
      key,
      JSON.stringify(value),
      {
        EX: ttlSeconds
      }
    );
  } catch (error) {
    console.log("Redis set failed:", error.message);
  }
};

const deleteCache = async (keys) => {
  const redisClient = await getClient();
  const cacheKeys = Array.isArray(keys) ? keys : [keys];

  if (!redisClient || cacheKeys.length === 0) {
    return;
  }

  try {
    await redisClient.del(cacheKeys);
  } catch (error) {
    console.log("Redis delete failed:", error.message);
  }
};

const deleteByPattern = async (pattern) => {
  const redisClient = await getClient();

  if (!redisClient) {
    return;
  }

  try {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.log("Redis pattern delete failed:", error.message);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteByPattern
};
