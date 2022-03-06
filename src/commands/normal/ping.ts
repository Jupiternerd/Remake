// imports
import { CommandInteraction } from "discord.js";
const { SlashCommandBuilder } = require("@discordjs/builders")
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";

// author = Shokkunn

/**
 * Name | Ping command
 */
class Ding extends Commands {
    constructor() {
        super("ding", // name 
        "does super cool stuff like ding -> dong.",
        {
            coolDown: 5000
        },
        new SlashCommandBuilder().addSubcommand(subc => 
            subc
            .setName("test")
            .setDescription("description for 1_test"))
        )
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        interaction.reply("dong");
    }

    public async test(bot: client, interaction: CommandInteraction): Promise<void> {
        interaction.reply("Test!")
    }
}

export = Ding; // require doesn't seem to like export default class.