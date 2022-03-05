// imports
import client from "../../amadeus/client";
import Listener from "../../amadeus/listeners";
import { StaticBotData } from "../../types/payloads/static";
import Mango from "../../utilities/mongodb/mango";

// author = shokkunn

class Startup extends Listener {
    constructor() {
        super(
            "ready", {
                once: true
            }
        )
    }

    async execute(bot: client): Promise<void> {
        // log that the bot is logged in.
        console.info("\n🌼 " + bot.name + " is currently serving: " + bot.guilds.cache.size + " servers.");

        // get static bot db.
        const botDB = await Mango.DB_STATIC.collection<StaticBotData>("bot").findOne()

        // set the bot presence to a random one from the collection.
        bot.user.setPresence(botDB.activity_feed[Math.floor(Math.random() * botDB.activity_feed.length)]);

        
        
    }
}

export = Startup;