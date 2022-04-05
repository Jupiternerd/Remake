//imports

import { basic } from "../local/static";

// author = shokkunn

export enum ItemType {
    food,
    equipable,
}

export type ItemTypeStrings = keyof typeof ItemType;

export interface Item extends basic {
    giftable?: boolean,
    description: string;
    type?: ItemTypeStrings
    values?: Array<any>
    //stackable: boolean;
}