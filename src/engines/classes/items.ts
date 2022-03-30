//imp

import { Item } from "../../types/models/items";
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
}