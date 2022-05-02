//imps

import { basic, FixedLengthArray } from "../local/static";
import { BackgroundCapsule } from "./stories";

// author = shokkunn
export interface MoodInUser {
    current: number,
    meter: number,
    meterxp: number
}

export type recentInteractTypes = "system" | "interact"

export interface recentGift {
    date: Date,
    itemID: number
}
export interface StatsInUser {
    level: number,
    xp: number,
    mood: MoodInUser
    hunger: number,
    gift: {
        likes: Array<number>
        dislikes: Array<number>
        recentReceived: Array<recentGift>
    }
    recentInteract: {
        type: recentInteractTypes,
        time: Date
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
    level: number,
    exp: number
    inventory: {
        transferable: Array<ItemInUser>
        intransferable: intransferable
    }
}

export interface StatisticsUser extends basic {
    

}