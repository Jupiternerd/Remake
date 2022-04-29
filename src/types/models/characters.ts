import { basic, FixedLengthArray } from "../local/static";


export interface CharacterBasic extends basic {
    pointers: {
        variant?: TemporaryMoodTypeStrings
        original?: number
        skin?: number
        interaction: number
    }
    stories: {
        interact: Array<number>
        gift: Array<number>
    }
}
export enum TemporaryMoodType {
    normal,
    happy,
    sad,
    annoyed,
    flustered,
    hungry
}
export type TemporaryMoodTypeStrings = keyof typeof TemporaryMoodType | "current";

export enum AdvancementMoodType {
    hate,
    detest,
    annoyed,
    tolerant,
    friendly,
    passionate,
    intimate,
    obsessed,
    loved,
    goal
}

export type AdvancementMoodTypeStrings = keyof typeof AdvancementMoodType

export enum MoodEmoji {
    "💟",
    "😄",
    "⛈️",
    "💢",
    "💞",
    "😋"
}

export interface CharacterSkins extends basic {
    pointer: number
    moods: FixedLengthArray<[string, string, string, string, string]>
}

export interface Reaction {
    mood: TemporaryMoodTypeStrings,
    content: string
}

export interface CharacterInteractions extends basic {
    pointers: number,
    base: {
        greetings: Array<string>
        farewells: Array<string>
    }
    gifts: { 
        default: Array<Reaction>
        likes: Array<Reaction>
        dislikes: Array<Reaction>
        aboveTier: Array<Reaction>
        belowTier: Array<Reaction>
        averageTier: Array<Reaction>
        duplicate: Array<Reaction>
        hunger: {
            food: Array<Reaction>
            other: Array<Reaction>
        }
        none: Array<Reaction>
    }
}

