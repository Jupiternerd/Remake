import { PresenceData } from "discord.js"

export interface basic {
    _id: number,
    name: string,
}

export interface StaticBotData {
    activity_feed: Array<PresenceData>
}