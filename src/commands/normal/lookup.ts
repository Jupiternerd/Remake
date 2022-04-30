// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import Queries from "../../utilities/mongodb/queries";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CharacterBasic } from "../../types/models/characters";

// author = Shokkunn

/**
 * Name | Level command
 */
class LookUp extends Commands {
    constructor() {
        super("lookup", // name 
        "Look up anything.",
        {
            coolDown: 3000
        },
        new SlashCommandBuilder()
            .addSubcommand(subc => 
            subc
            .setName("item")
            .setDescription("look up an Item")
            .addIntegerOption((option) =>
                option
                .setName('item')
                .setDescription('ITEM ID')
                .setRequired(true)))
            .addSubcommand(subc => 
            subc
            .setName("tomo")
            .setDescription("look up a Tomo")
            .addIntegerOption((option) =>
                option
                .setName('tomo')
                .setDescription('Tomo ID')
                .setRequired(true)))
        )
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        console.log("Executed")
    }

    public async item(interaction: CommandInteraction) {
        const itemID = interaction.options.getInteger("item");
        const ITEM = await Queries.item(itemID);

        interaction.reply(ITEM.name);


    }

    public async tomo(interaction: CommandInteraction) {
        const tomoID = interaction.options.getInteger("tomo");
        const TOMO: CharacterBasic = await Queries.character(tomoID, "basic") as CharacterBasic;

        interaction.reply(TOMO.name);


    }
}

export = LookUp; // require doesn't seem to like export default class.