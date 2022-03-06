// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/handlers/commands";
import Square from "../../utilities/redis/square";

// author = Shokkunn

/**
 * Name | Ping command
 */
class Flush extends Commands {
    constructor() {
        super("flush", // name 
        "flushes DB",
        {
            ownerOnly: true
        }
        )
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        console.log(await Square.flushAll());
        interaction.reply("Flushed");
    }
}

export = Flush; // require doesn't seem to like export default class.