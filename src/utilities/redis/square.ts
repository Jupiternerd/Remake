// imports
import Redis from "ioredis";

// declare global variables
let mem: Redis.Redis, port: 6379

// author = shokkunn

/**
 * Name | Square
 * Desc | Redis utility class.
 */
export default class Square {

    /**
     * Name | con
     * Desc | Connect to the redis db.
     */
    static async con() {

        mem = new Redis(port) // init new redis.
        console.info("Redis connected.")
    }

    // Returns ioRedis class.
    static memory() {
        return mem;
    }

    // Flushes the Redis database.
    static async flushAll() {
        console.log(await mem.flushdb())
    }

}
