// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import Queries from "../../utilities/mongodb/queries";
import { UniverseUser } from "../../types/models/users";
import { GUIUtils } from "../../utilities/engineUtilities/utils";

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
        })
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {

    }

    public async item(interaction: CommandInteraction) {

    }

    public async tomo(interaction: CommandInteraction) {


    }
}

export = LookUp; // require doesn't seem to like export default class.