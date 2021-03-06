// imports
import { CommandInteraction, MessageSelectMenu, MessageSelectMenuOptions, MessageActionRow, Message, MessageComponentInteraction, MessageButtonOptions, MessageButton, CollectorFilter} from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import { EngineUtils, StringUtils } from "../../utilities/engineUtilities/utils";
import Users from "../../engines/classes/users";

// author = Shokkunn

/**
 * Name | Ping command
 */
class Inventory extends Commands {
    constructor() {
        super("inventory", // name 
        "Shows your inventory",
        {
            coolDown: 8000
        })
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        const MAX_COLUMN = 25;
        const USER: Users = new Users(interaction.user.id);
        const FILTER: CollectorFilter<[unknown]> = async(i: MessageComponentInteraction) => { await i.deferUpdate(); return i.user.id == interaction.user.id };

        await USER.pullUniverse();

        const INVENTORY = await USER.populateTransferableInventory()
        let col = await EngineUtils.fillSelectWithInventory(INVENTORY, MAX_COLUMN), curItem: number;

        // Prunes the buttons to move the menu.
        for (let i = 0; i < col.length - 1; i++) {
            for (let j = 0; j < col[i].length - 1; j++) {
                if (col[i][j].route == "backInventoryPage" || col[i][j].route == "nextInventoryPage") col[i].splice(j, 1);
            }
        }

        const COMPONENT: MessageSelectMenuOptions = {
            placeholder: "⚠️ Prettier Version Soon! Temporary Command.",
            customId: "CMD_INVENTORY.select_" + "0" + "_user_" + interaction.user.id,
            options: col[0]
        }

        await interaction.reply({
            components: [new MessageActionRow().addComponents(new MessageSelectMenu(COMPONENT))]
        })

        const MSG: Message<true> = await interaction.fetchReply() as Message<true>;

        const COLLECTOR = MSG.createMessageComponentCollector({
            "componentType": "SELECT_MENU",
            "filter": FILTER,
            "time": 60000
        })

        COLLECTOR.on("collect", async (i) => {
            const ITEMID = col[0][parseInt(i.values[0])].item._id as number;
            if (curItem == ITEMID) return;
            const ITEM = INVENTORY.find(i => i._id == ITEMID);

            curItem = ITEMID;
            COLLECTOR.resetTimer();
            await interaction.editReply({content: "Test", embeds: [ITEM.getInfoOutput.addField("Amount In Inventory", 'x' + ITEM.amount.toString(), )]})
        })

        COLLECTOR.once("end", async (i) => {
            interaction.editReply({content: "Connection :: timed-out. \`\`/inventory\`\` again to view!", components: [], embeds: []})
        })
    }
}

export = Inventory; // require doesn't seem to like export default class.