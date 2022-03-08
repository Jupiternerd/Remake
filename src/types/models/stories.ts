import { MessageSelectMenuOptions } from "discord.js";
import { basic } from "../local/static";
import { TemporaryMoodTypeStrings } from "./characters";

export type DisplayTypes = "wallpaper" | "duet" | "normal";
export type SpecialTypes = "selection" | "timed" | "normal";

export interface CharacterCapsule {
    id: number,
    useSkin?: boolean,
    mood?: TemporaryMoodTypeStrings
}

export interface BaseSingle {
    i?: number;
    bg?: number;
    ch?: Array<CharacterCapsule>
}

export interface NovelSingle extends BaseSingle {
    txt?: string;
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
    mutiples: Array<NovelSingle>
}