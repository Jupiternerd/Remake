import { basic } from "../local/static";


export interface CharacterBasic extends basic {
    description: string,
    pointers: {
        skin: number,
        interaction: number
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
export type TemporaryMoodTypeStrings = keyof typeof TemporaryMoodType

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
    moods: Array<string>
    painting: string
}

export interface CharacterInteractions extends basic{
    pointer: {
        story: number,
        basic: number
    }
    base: {
        greetings: Array<string>
        farewells: Array<string>
    }
    gifts: {
        default: Array<string>
        likes: Array<string>
        dislikes: Array<string>
        aboveTier: Array<string>
        belowTier: Array<string>
        averageTier: Array<string>
        duplicate: Array<string>
        hunger: {
            food: Array<string>
            other: Array<string>
        }
        none: Array<string>

    }
}