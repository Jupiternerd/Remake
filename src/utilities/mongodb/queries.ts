//imports

import { Redis } from "ioredis";
import { basic } from "../../types/local/static";
import { BackgroundBasic } from "../../types/models/backgrounds";
import { CharacterSkins } from "../../types/models/characters";
import { UniBaseNotFoundError } from "../errors/errors";
import Square from "../redis/square";
import Mango from "./mango";

// auth = shokkunn


//global
const EXPIRATION = parseInt(process.env.REDISEXPIRATION);

/**
 * All of the transactions are cached in redis so if it's already stored we will use it until it's ttl is depleaded.
 */
export default class Queries {


    /**
     * Name | character
     * Desc | gets basic, skins or interactions of a character from db or redis.
     * @param id id 
     * @param collections the collection you want to access
     * @returns character assets
     */
    public static async character(id: number, collections: "basic" | "skins" | "interactions"): Promise<basic> {
        // define variables
        let payload: basic, cache: string, redis: Redis = Square.memory(), key: string = `ch_${collections}_${id.toString()}`

        // try and see if we can get the cache, if not we can just get the data from mongodb it self.
        try {
            cache = await redis.get(key);
            if (!cache) {
                payload = await Mango.DB_CHARACTERS.collection<basic>(collections).findOne({_id: id})
                if (!payload) throw new UniBaseNotFoundError(id)

                // store the payload in redis.
                redis.set(key, JSON.stringify(payload))
                redis.expire(key, EXPIRATION)
                return payload;
            }
            
            return JSON.parse(cache) as basic;

        } catch(error) {
            console.error(error);
        } finally {
            // send back the payload.
            return payload;
        }
    }

    /**
     * Name | background
     * Desc | grabs background data from mongodb or redis.
     * @param id id
     * @returns background assets
     */
    public static async background(id: number): Promise<BackgroundBasic> {
        // define variables
        let payload: BackgroundBasic, cache: string, redis: Redis = Square.memory(), key: string = `bg_${id.toString()}`

        // try and see if we can get the cache, if not we can just get the data from mongodb it self.
        try {
            cache = await redis.get(key);
            if (!cache) {
                payload = await Mango.DB_BACKGROUNDS.collection<BackgroundBasic>("basics").findOne({_id: id})
                if (!payload) throw new UniBaseNotFoundError(id)

                // store the payload in redis.
                redis.set(key, JSON.stringify(payload))
                redis.expire(key, EXPIRATION)
                return payload;
            }
            
            return JSON.parse(cache) as BackgroundBasic;

        } catch(error) {
            console.error(error);
        } finally {
            // send back the payload.
            return payload;
        }
    }
}