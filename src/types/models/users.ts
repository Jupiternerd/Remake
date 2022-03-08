//imps

import { basic } from "../local/static";
import { Item } from "./items";

// author = shokkunn

export interface ChInUser extends basic {
    skinToUse: number | null
}



export interface UniverseUser extends basic {
    inventory: {
        transferable: Array<Item>
        intransferable: {
            bgs: Array<number>
            chs: Array<ChInUser>
            skins: Array<number>
        }
    }


}

export interface StatisticsUser extends basic {
    

}