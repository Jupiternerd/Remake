// imports

import { CommandInteraction, Interaction } from "discord.js";
import client from "../../amadeus/client";
import Listener from "../../amadeus/listeners";

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

    }
}

export = Startup;