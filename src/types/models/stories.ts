import { APIButtonComponent, APIButtonComponentWithCustomId } from "discord-api-types";
import { MessageAttachment, MessageSelectMenuOptions } from "discord.js";
import { basic } from "../local/static";
import { TemporaryMoodTypeStrings } from "./characters";

export type DisplayTypes = "wallpaper" | "duet" | "normal";
export type SpecialTypes = "selection" | "timed" | "normal";

export interface CharacterCapsule {
    id: number,
    useSkin?: boolean,
    mood?: TemporaryMoodTypeStrings
}

export interface BackgroundCapsule {
    id: number,
    blurred: boolean
}

export interface BaseSingle {
    i?: number;
    bg?: BackgroundCapsule,
    ch?: Array<CharacterCapsule>
}

export interface NovelSingle extends BaseSingle {
    txt?: {
        speaker: number | "monologue"
        content: string
    }
    type?: {
        display?: DisplayTypes
        special?: {
            type?: SpecialTypes
            wait?: number,
            choices?: Array<MessageSelectMenuOptions>
            default?: string,
            button?: APIButtonComponentWithCustomId
        }
    }
    built?: MessageAttachment
    backable?: boolean;
}

export interface Story extends basic {
    mutiples: Array<NovelSingle>
}