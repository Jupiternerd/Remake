//imps

import { basic } from "../local/static";
import { Item } from "./items";

// author = shokkunn

export interface ChInUser extends basic {
    skinToUse: number | null,
    bgToUse: number | null,
    
}

export interface ItemInUser {
    _id: number,
    amount: number
}


export interface UniverseUser extends basic {
    inventory: {
        transferable: Array<ItemInUser>
        intransferable: {
            bgs: Array<number>
            chs: Array<ChInUser>
            skins: Array<number>
        }
    }
}

export interface StatisticsUser extends basic {
    

}