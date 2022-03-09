//imports

import { Redis } from "ioredis";
import { basic } from "../../types/local/static";
import { BackgroundBasic } from "../../types/models/backgrounds";
import { CharacterBasic, CharacterInteractions, CharacterSkins, TemporaryMoodTypeStrings } from "../../types/models/characters";
import { Item } from "../../types/models/items";
import { StatisticsUser, UniverseUser } from "../../types/models/users";
import { UniBaseNotFoundError, UserNotFoundError } from "../errors/errors";
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
    public static async character(id: number, collections: "basic" | "skins" | "interactions"): Promise<basic | CharacterSkins | CharacterBasic | CharacterInteractions> {
        // define variables
        let payload: basic, cache: string, redis: Redis = Square.memory(), key: string = `ch_${collections}_${id.toString()}`

        // try and see if we can get the cache, if not we can just get the data from mongodb it self.
        try {
            cache = await redis.get(key);
            // if there is a cache
            if (cache) {
                // parse it.
                payload = JSON.parse(cache) as basic;
                return payload; // return it.
            }

            // if there is no cache.
            payload = await Mango.DB_CHARACTERS.collection<basic>(collections).findOne({_id: id})
            if (!payload) throw new UniBaseNotFoundError(id, collections + "_" + "ch")

            // store the payload in redis.
            redis.set(key, JSON.stringify(payload))
            redis.expire(key, EXPIRATION)

        } catch(error) {
            console.error(error);
        } finally {
            // send back the payload.
            return payload;
        }
    }

    public static async characterBasicVariant(originalId: number, mood: TemporaryMoodTypeStrings) {
        let payload: CharacterBasic, cache: string, redis: Redis = Square.memory(), key: string = `chv_${originalId.toString()}`

        // try and see if we can get the cache, if not we can just get the data from mongodb it self.
        try {
            cache = await redis.get(key)
            if (cache) {
                //parse it.
                payload = JSON.parse(cache) as CharacterBasic;
                return payload;
            }

            payload = await Mango.DB_CHARACTERS.collection<CharacterBasic>("basic").findOne({'pointers.original': originalId, 'pointers.variant': mood})
            if (!payload) throw new UniBaseNotFoundError(originalId, "variant")

            //store in redis.
            redis.set(key, JSON.stringify(payload))
            redis.expire(key, EXPIRATION)

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
            // if there is a cache
            if (cache) {
                // parse it.
                payload = JSON.parse(cache) as BackgroundBasic;
                return payload; // return it.
            }

            // if there is no cache.
            payload = await Mango.DB_BACKGROUNDS.collection<BackgroundBasic>("basic").findOne({_id: id})
            if (!payload) throw new UniBaseNotFoundError(id, "bg")

            // store the payload in redis.
            redis.set(key, JSON.stringify(payload))
            redis.expire(key, EXPIRATION)
            return payload;

        } catch(error) {
            console.error(error);
        } finally {
            // send back the payload.
            return payload;
        }
    }

    /**
     * Name | user
     * Desc | grabs user data from mongodb only.
     * @param id id of the user
     * @param collections the col u want to grab from.
     */
    public static async user(id: string, collections: "universe" | "statistics"): Promise<UniverseUser | StatisticsUser> {
        // define
        let payload: basic;
        try {
            // grab from the database.
            payload = await Mango.DB_USERS.collection<basic>(collections).findOne({_id: id});
            if (!payload) throw new UserNotFoundError(id) // error logging.
        } catch (error) {
            console.error(error);
        } finally {
            // return the payload.
            return payload;
        }
    }

    public static async item(id: number): Promise<Item> {
         // define variables
         let payload: Item, cache: string, redis: Redis = Square.memory(), key: string = `item_${id.toString()}`

         // try and see if we can get the cache, if not we can just get the data from mongodb it self.
         try {
             cache = await redis.get(key);
             // if there is a cache
             if (cache) {
                 // parse it.
                 payload = JSON.parse(cache) as Item;
                 return payload; // return it.
             }
 
             // if there is no cache.
             payload = await Mango.DB_STATIC.collection<Item>("items").findOne({_id: id})
             if (!payload) throw new UniBaseNotFoundError(id, "items")
 
             // store the payload in redis.
             redis.set(key, JSON.stringify(payload))
             redis.expire(key, EXPIRATION)
 
         } catch(error) {
             console.error(error);
         } finally {
             // send back the payload.
             return payload;
         }
    }
}