// imports
import { CommandInteraction, MessageSelectMenu, MessageSelectMenuOptions, MessageActionRow, Message, MessageComponentInteraction} from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import { EngineUtils } from "../../utilities/engineUtilities/utils";
import Users from "../../engines/classes/users";
import { SelectItemMenuChoices } from "../../types/models/stories";
import { SelectMenuComponent } from "@discordjs/builders";
import { RawMessageSelectMenuInteractionData } from "discord.js/typings/rawDataTypes";

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
        const USER: Users = new Users(interaction.user.id);

        await USER.pullUniverse();

        const INVENTORY = await USER.populateTransferableInventory()
        let col = await EngineUtils.fillSelectWithInventory(INVENTORY, 25)

        // Prunes the buttons to move the menu.
        for (let i = 0; i < col.length - 1; i++) {
            for (let j = 0; j < col[i].length - 1; j++) {
                if (col[i][j].route == "backInventoryPage" || col[i][j].route == "nextInventoryPage") col[i].splice(j, 1)
            }
        }

        const COMPONENT: MessageSelectMenuOptions = {
            // If this single has it's own default place holder. If not provide our own.
            // Also if there is a selection we will put the selection as the label. ( deprecated, since discord already does it )
            placeholder: "WARNING: Prettier command soon. Work around for now.",
            //this.selection == undefined ? (this.multiples[this.index].type.special.default ? this.multiples[this.index].type.special.default : "Select an option") : this.multiples[this.index].type.special.choices[this.selection].label,
            customId: "CMD_INVENTORY.select_" + "0" + "_user_" + interaction.user.id,
            options: col[0]
        }

        await interaction.reply({
            components: [new MessageActionRow().addComponents(new MessageSelectMenu(COMPONENT))]
        })

        const MSG: Message<true> = await interaction.fetchReply() as Message<true>;

        const COLLECTOR = MSG.createMessageComponentCollector({
            "componentType": "SELECT_MENU",
            "filter": async(i: MessageComponentInteraction) => { await i.deferUpdate(); return i.user.id == interaction.user.id },
            "time": 60000
        })

        COLLECTOR.on("collect", async (i) => {
            const ITEMID = col[0][parseInt(i.values[0])].item._id as number;
            const ITEM = INVENTORY.find(i => i._id == ITEMID)
            
            await interaction.editReply({content: `${ITEM.basic.emoji} ITEM: ${ITEM.formattedOutput}\n❓ DESC: ${ITEM.basic.description}\n🎁 GIFTABLE? ${ITEM.giftable}\n\n🔢 AMOUNT IN INVENTORY: ` + ITEM.amount})
        })

        

    }

}

export = Inventory; // require doesn't seem to like export default class.