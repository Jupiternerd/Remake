// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client";
import Commands from "../../amadeus/commands";

// author = Shokkunn

/**
 * Name | Ping command
 */
class Ding extends Commands {
    constructor() {
        super("ding", // name 
        "does super cool stuff like ding -> dong." // description;
        )
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        return interaction.reply("Dong!")
    }
}

export = Ding; // require doesn't seem to like export default class.