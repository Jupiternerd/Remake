//imps

import { basic, FixedLengthArray } from "../local/static";
import { BackgroundCapsule } from "./stories";

// author = shokkunn
export interface MoodInUser {
    current: number,
    meter: number,
    meterxp: number
}

export interface recentGift {
    date: Date,
    itemID: number
}
export interface StatsInUser {
    level: number,
    xp: number,
    mood: MoodInUser
    gift: {
        likes: Array<number>
        dislikes: Array<number>
        recentReceived: FixedLengthArray<[recentGift, recentGift, recentGift]>
    }
    inventory: Array<ItemInUser>
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

export interface intransferable { 
    bgs: Array<number>
    chs: Array<ChInUser>
    skins: Array<number>
}

export interface UniverseUser extends basic {
    inventory: {
        transferable: Array<ItemInUser>
        intransferable: intransferable
    }
}

export interface StatisticsUser extends basic {
    

}