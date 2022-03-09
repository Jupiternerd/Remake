// author = shokkunn

import { TemporaryMoodType, TemporaryMoodTypeStrings } from "../../types/models/characters";

// Constants
const EMOJI_CONSTANTS = {
    filledBar: "▰",
    emptyBar: "▱"
}

export class GUIUtils {
    /**
     * Name | barUI
     * Desc | a handy tool to display progress.
     * @returns a string represntation of the bar.
     * @param fill number of bars to fill
     * @param total number of bars in total
     */
    static async barUI(fill: number = 0, total: number = 10): Promise<string> {
        // define
        let ret: string = "";

        // loop through total:
        for (let i = 0; i < total; i++) {
            ret += (fill <= 0 ? EMOJI_CONSTANTS.emptyBar : EMOJI_CONSTANTS.filledBar);
            fill--;
          }        

        return ret;
    }
}

export class MathUtils {
    /**
     * Name | randIntFromZero
     * Desc | returns a number from 0 to the max.
     * @param max number that's the ceiling.
     */
    static async randIntFromZero(max: number): Promise<number> {
        return (Math.floor(Math.random() * max))
    }
}

export class StringUtils {
    /**
     * Name | capitalizeFirstLetter
     * Desc | read name.
     * @param string you want to capitalize
     * @returns string 
     */
    static async capitalizeFirstLetter(string: string): Promise<string> {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Name | periodTheString
     * Desc | read name.
     * @param string you want to period.
     * @returns string
     */
    static async periodTheString(string: string): Promise<string> {
        return (string.endsWith('.') && !string.endsWith("?" || "!") ? string : string + '.');
    }
}

export class EngineUtils {
    /**
     * Name | convertStrToMoodNumber
     * Desc | Does what is says, string -> int for mood types.
     * @param str | string you want to convert to int.
     * @returns Temporary Mood State that is in int format.
     */
    public static convertStrToMoodNumber(str: TemporaryMoodTypeStrings) {
        return TemporaryMoodType[str] as number;
    }

    /**
     * Name | convertNumberToMoodStr
     * Desc | string mood -> int
     * @param int | int that you want to convert to string.
     * @returns Temporary Mood State that is in str format.
     */
    public static convertNumberToMoodStr(int: number) {
        if (int > Object.keys(TemporaryMoodType).length / 2) return; // Since int is larger than the enums.
        return TemporaryMoodType[int] as TemporaryMoodTypeStrings;
    }

    /**
     * Name | getCharacterCacheKey
     * Desc | Combines two seperate identifiers in the middle with a "_";
     * @param id | id of the character
     * @param mood | mood that you want to retrieve @default normal
     * @returns {string} of key.
     */
    public static getCharacterCacheKey(id: number, mood: TemporaryMoodTypeStrings = "normal") {
        return `${id}_${mood}`
    }

    /**
     * Name | getBackgroundCacheKey
     * Desc | Combines two seperate identifiers in the middle with a "_";
     * @param id | id of the bg
     * @param bool | if you want the blurred version or not.
     * @returns {string} of key.
     */
     public static getBackgroundCacheKey(id: number, bool: boolean = false) {
        return `${id}_${bool}`
    }
}