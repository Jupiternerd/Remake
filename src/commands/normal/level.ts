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
class Level extends Commands {
    constructor() {
        super("level", // name 
        "Shows you your level.",
        {
            coolDown: 10000
        })
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        const USER = await Queries.user(interaction.user.id, "universe") as UniverseUser;
        if (!USER) return;
        const FLOOR: number = Math.floor(USER.exp / 10);
        const GUI: string = await GUIUtils.barUI(FLOOR, 10)
        interaction.reply(`\`\`${USER.level}\`\` ${GUI} \`\`${USER.level + 1}\`\`\n✨ EXP • \`\`${USER.exp}\`\` / 100`);
    }
}

export = Level; // require doesn't seem to like export default class.