// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client";
import Commands from "../../amadeus/commands";
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
        await Square.flushAll();
        interaction.editReply("Flushed");
    }
}

export = Flush; // require doesn't seem to like export default class.