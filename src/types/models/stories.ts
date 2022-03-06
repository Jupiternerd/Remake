import { basic } from "../local/static";
import { TemporaryMoodTypeStrings } from "./characters";

export type SingleTypes = "wallpaper" | "selection" | "timed" | "normal";

export interface Single {
    i?: number;
    bg?: number;
    ch?: {
        id: number,
        useSkin?: boolean,
        mood: TemporaryMoodTypeStrings
    }
    txt?: number;
    type: SingleTypes;
    backable?: boolean;
}

export interface Story extends basic {
    mutiples: Array<Single>
    

}