import { MessageAttachment, MessageButtonOptions, MessageSelectMenuOptions, MessageSelectOption, MessageSelectOptionData } from "discord.js";
import { RawMessageSelectMenuInteractionData } from "discord.js/typings/rawDataTypes";
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

export type NovelScript = "next" | "back";

export interface SelectMenuChoices extends MessageSelectOptionData {
    route: number | NovelScript
}

export interface NovelSingle extends BaseSingle {
    txt?: {
        speaker: number | "monologue" | "user"
        content: string
    }
    type?: {
        display?: DisplayTypes
        special?: {
            type?: SpecialTypes
            wait?: number,
            choices?: Array<SelectMenuChoices>
            default?: string
        }
    }
    built?: MessageAttachment
    backable?: boolean;
}

export interface Story extends basic {
    mutiples: Array<NovelSingle>
}