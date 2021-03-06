// imports
import { MongoClient } from "mongodb"

// declare global variables.
let client: MongoClient, retries: number = 0, retryLimit: number = 20;

// author = shokkunn

/**
 * Mongodb utility class.
 */
export default class Mango {

    /**
     * Name | con
     * Desc | Connects to mongodb server using the URI stored in .env.
     */
    static async con() {
        // declare variables needed for function.
        client = new MongoClient(process.env.URI);

        if (retries > retryLimit) throw Error("MongoDB retry limit reached.") // to stop itself from looping.
        
        try {
            // to see how long it takes to connects to the db.
            console.time("Mongo_DB_Connect")

            await client.connect(); // login to mongoDB.

        } catch(error) {
            // if there is error we retry.
            console.error(error);
            retries++; // + 1 retries.

            await Mango.con(); // recursively call itself again.

        } finally {
            // when the db connects.
            console.timeEnd("Mongo_DB_Connect") // end the clock.
            console.info("\n⛅ Mongo connected. With " + (retries > 0 ? `${retries} amount of ` : `no `) + "retries.") // if there is more than one retry we notify. 
        }

    }

    /**
     * Name | DB_STATIC
     * Desc | returns the database static.
     * @returns mongodb db.
     */
    static get DB_STATIC() {
        return client.db("static")
    }

    /**
     * Name | DB_CHARACTERS
     * Desc | returns the database ch.
     * @returns mongodb db.
     */
    static get DB_CHARACTERS() {
        return client.db("characters")
    }

    /**
     * Name | DB_BACKGROUNDS
     * Desc | returns the database bg.
     * @returns mongodb db.
     */
    static get DB_BACKGROUNDS() {
        return client.db("backgrounds")
    }
    /**
     * Name | DB_USERS
     * Desc | returns the database users.
     * @returns mongodb db.
     */
     static get DB_USERS() {
        return client.db("users")
    }
    

}