// imports
import { CommandInteraction } from "discord.js";
const { SlashCommandBuilder } = require("@discordjs/builders")
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";

// author = Shokkunn

/**
 * Name | Ping command
 */
class Inventory extends Commands {
    constructor() {
        super("inventory", // name 
        "Shows your inventory",
        {
            coolDown: 5000
        })
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        
    }
}

export = Inventory; // require doesn't seem to like export default class.