import { MessageSelectMenuOptions } from "discord.js";
import { basic } from "../local/static";
import { TemporaryMoodTypeStrings } from "./characters";

export type DisplayTypes = "wallpaper" | "duo" | "normal";
export type SpecialTypes = "gift" | "timed" | "normal";

export interface Single {
    i?: number;
    bg?: number;
    ch?: Array<{
        id: number,
        useSkin?: boolean,
        mood: TemporaryMoodTypeStrings
    }>
    txt?: number;
    type?: {
        display: DisplayTypes
        special: {
            type: SpecialTypes
            wait?: number,
            choices?: Array<MessageSelectMenuOptions>
        }
    }
    backable?: boolean;
}

export interface Story extends basic {
    mutiples: Array<Single>
    

}