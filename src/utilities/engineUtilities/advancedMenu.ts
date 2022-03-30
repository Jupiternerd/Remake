import { EventEmitter } from "events";
import { CommandInteraction, MessageActionRow, MessageSelectOptionData } from "discord.js";


export default class AdvanceMenu extends EventEmitter {

    ARR: Array<Array<MessageSelectOptionData>>;
    col: number;
    row: number;
    interaction: CommandInteraction;


    constructor(arrayOfArr: Array<Array<MessageSelectOptionData>>, interaction: CommandInteraction) {
        super()
    }

    public async action(): Promise<MessageActionRow[]> {
        return;

    }
    public async start() {
        this.interaction.editReply({
            components: await this.action()
        })
        
    }
}