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
    constructor(item: Item) {
        super(item._id, item)
        this.giftable = item?.giftable || false;
    }
}