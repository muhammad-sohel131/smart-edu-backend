import { createClient } from 'redis';
import { envVars } from './env';

export const redisClient = createClient({
    username: envVars.REDIS.REDIS_USERNAME,
    password: envVars.REDIS.REDIS_PASSWORD,
    socket: {
        host: envVars.REDIS.REDIS_HOST,
        port: Number(envVars.REDIS.REDIS_PORT),
        reconnectStrategy: (retries) => {
            if (retries > 2) {
                return false; // Stop retrying after 2 attempts
            }
            return 500;
        }
    }
});

redisClient.on('error', (err) => {
    // Log error only if redis was previously connected or in debug
    if (redisClient.isOpen) {
        console.error('Redis Client Error:', err);
    }
});

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Redis is connected!");
        }
    } catch (err: any) {
        console.warn(`⚠️ Warning: Redis connection failed (${err?.message || err}).`);
        console.warn("⚠️ Server started successfully, but OTP/Redis features will be disabled until valid Redis credentials are provided.");
    }
};

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar
