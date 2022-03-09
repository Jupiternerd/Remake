// imports
import client from "../../amadeus/client/client";
import Listener from "../../amadeus/abstracts/listeners";
import { StaticBotData } from "../../types/models/bot";
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

        // set the bot presence to a random one from the collection.
        setInterval(async () => {
            const botDB = await Mango.DB_STATIC.collection<StaticBotData>("bot").findOne();
            bot.user.setPresence(botDB.activity_feed[Math.floor(Math.random() * botDB.activity_feed.length)])
        }, 60000) // every minute

        
        
    }
}

export = Startup;