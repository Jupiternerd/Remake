//imp

import { MessageEmbed } from "discord.js";
import { Item } from "../../types/models/items";
import { StringUtils } from "../../utilities/engineUtilities/utils";
import UniBase from "./base";

// auth = shokkunn

export default class ItemClass extends UniBase {
    /**
     * Name | Background
     * Desc | encapsulates basic background class.
     * @param basic 
     */
    declare basic: Item
    public giftable?: boolean;
    public amount?: number;
    constructor(item: Item, amount: number = 0) {
        super(item._id, item)
        this.giftable = item?.giftable || false;
        this.amount = amount;
    }

    get getInfoOutput(): MessageEmbed {
        return super.getInfoOutput.addField(
            "Item Information", 
            `Giftable :: ${StringUtils.boolToReadable(this.giftable)}`,
            true
        ).setTitle(`${this.basic.emoji} ` + this.formattedOutputNoMarkUp);
    }
}