"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const env_1 = require("./env");
exports.redisClient = (0, redis_1.createClient)({
    username: env_1.envVars.REDIS.REDIS_USERNAME,
    password: env_1.envVars.REDIS.REDIS_PASSWORD,
    socket: {
        host: env_1.envVars.REDIS.REDIS_HOST,
        port: Number(env_1.envVars.REDIS.REDIS_PORT),
        reconnectStrategy: (retries) => {
            if (retries > 2) {
                return false; // Stop retrying after 2 attempts
            }
            return 500;
        }
    }
});
exports.redisClient.on('error', (err) => {
    // Log error only if redis was previously connected or in debug
    if (exports.redisClient.isOpen) {
        console.error('Redis Client Error:', err);
    }
});
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!exports.redisClient.isOpen) {
            yield exports.redisClient.connect();
            console.log("Redis is connected!");
        }
    }
    catch (err) {
        console.warn(`⚠️ Warning: Redis connection failed (${(err === null || err === void 0 ? void 0 : err.message) || err}).`);
        console.warn("⚠️ Server started successfully, but OTP/Redis features will be disabled until valid Redis credentials are provided.");
    }
});
exports.connectRedis = connectRedis;
// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar
