// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import Queries from "../../utilities/mongodb/queries";
import { CharacterBasic } from "../../types/models/characters";

// author = Shokkunn

/**
 * Name | Pull
 */
class Pull extends Commands {
    constructor() {
        super("pull", // name 
        "Pulls from DB",
        {
            ownerOnly: true
        }
        )
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        console.time("DATA_RETRIEVAL")
        const DATA = await Queries.character(0, "basic") as CharacterBasic;
        console.timeEnd("DATA_RETRIEVAL")
        console.log(DATA)
        interaction.reply(DATA.name);
    }
}

export = Pull; // require doesn't seem to like export default class.