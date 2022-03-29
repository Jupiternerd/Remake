//imps

import { basic } from "../local/static";
import { BackgroundCapsule } from "./stories";

// author = shokkunn
export interface MoodInUser {
    current: number,
    meter: number,
    meterxp: number
}
export interface StatsInUser {
    level: number,
    xp: number,
    mood: MoodInUser
}

export interface ChInUser extends basic {
    skinToUse: number | null,
    bgToUse: BackgroundCapsule,
    stats: StatsInUser
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