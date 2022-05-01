// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import Queries from "../../utilities/mongodb/queries";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CharacterBasic } from "../../types/models/characters";
import Custom_Client from "../../amadeus/client/client";
import ItemClass from "../../engines/classes/items";
import Character from "../../engines/classes/characters";

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

    public async item(bot: Custom_Client, interaction: CommandInteraction) {
        console.log(interaction)
        const itemID = interaction.options.getInteger("item", true);
        const ITEM = new ItemClass(await Queries.item(itemID));

        interaction.reply({
            embeds: [ITEM.getInfoOutput]
        });


    }

    public async tomo(bot: Custom_Client, interaction: CommandInteraction) {
        const tomoID = interaction.options.getInteger("tomo", true);
        const TOMO = new Character(tomoID, await Queries.character(tomoID, "basic") as CharacterBasic)
        if (TOMO.basic.pointers.original != TOMO._id) return;

        interaction.reply({
            embeds: [TOMO.getInfoOutput]
        });


    }
}

export = LookUp; // require doesn't seem to like export default class.