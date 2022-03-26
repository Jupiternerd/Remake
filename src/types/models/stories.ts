import { MessageAttachment, MessageSelectOptionData } from "discord.js";
import { basic } from "../local/static";
import { TemporaryMoodTypeStrings } from "./characters";
import { ItemInUser } from "./users";

export type DisplayTypes = "wallpaper" | "duet" | "normal";
export type SpecialTypes = "selection" | "timed" | "normal";
export type InteractionTypes = "gift" | "interact";
export type CapsuleMood = TemporaryMoodTypeStrings | "current"

export type CharacterCapsule = {
    id: number,
    useSkin?: boolean,
    mood?: CapsuleMood
}

export interface BackgroundCapsule {
    id: number,
    blurred: boolean
}

export interface BaseSingle {
    i?: number;
    bg?: BackgroundCapsule,
    ch?: Array<CharacterCapsule>
    built?: MessageAttachment
}

export type NovelScript = "next" | "back";
export type DialogueScript = "greetings" | "farewells";

export interface SelectMenuChoices extends MessageSelectOptionData {
    route?: number | NovelScript | Array<number> 
}

export interface SelectItemMenuChoices extends MessageSelectOptionData {
    item: ItemInUser
}

export interface NovelSingle extends BaseSingle {
    txt?: {
        speaker: number | "monologue" | "user"
        content: string | DialogueScript
    }
    type?: {
        display?: DisplayTypes
        special?: {
            type?: SpecialTypes | InteractionTypes
            wait?: number,
            choices?: Array<SelectMenuChoices>
            default?: string
        }
        points?: {
            subtract?: number,
            add?: number
        }
    }
    backable?: boolean;
}

export interface Story extends basic {
    multiples: Array<NovelSingle>
}