// author = shokkunn

import Character from "../../engines/classes/characters";
import ItemClass from "../../engines/classes/items";
import { BaseGrade } from "../../types/local/static";
import { TemporaryMoodType, TemporaryMoodTypeStrings } from "../../types/models/characters";
import { CapsuleMood, DialogueScript, SelectItemMenuChoices } from "../../types/models/stories"
import { EngineError } from "../errors/errors";

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
    static randIntFromZero(max: number): number {
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
    static capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Name | periodTheString
     * Desc | read name.
     * @param string you want to period.
     * @returns string
     */
    static periodTheString(string: string): string {
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
    public static convertStrToMoodNumber(str: TemporaryMoodTypeStrings): number {
        return TemporaryMoodType[str] as number;
    }

    /**
     * Name | convertNumberToMoodStr
     * Desc | string mood -> int
     * @param int | int that you want to convert to string.
     * @returns Temporary Mood State that is in str format.
     */
    public static convertNumberToMoodStr(int: number): TemporaryMoodTypeStrings {
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
    public static getCharacterCacheKey(id: number, mood: TemporaryMoodTypeStrings): string {
        return `${id}_${mood}`;
    }

    /**
     * Name | getBackgroundCacheKey
     * Desc | Combines two seperate identifiers in the middle with a "_";
     * @param id | id of the bg
     * @param bool | if you want the blurred version or not.
     * @returns {string} of key.
     */
     public static getBackgroundCacheKey(id: number, bool: boolean = false): string {
        return `${id}_${bool}`;
    }

    /**
     * @name convertNumberToRarity
     * @description converts a integer to a string
     * @param int 
     * @returns 
     */
    public static convertNumberToRarity(int: number) {
        return BaseGrade[int] 
    }

    public static async fill_Select_With_Inventory(INVENTORY: Array<ItemClass>, maxPerColumn: number) {
        // declare.
        let i: number = 0, invI: number = 0, columnAmount = Math.ceil(INVENTORY.length / maxPerColumn), totalMax: number = 0, ret = [];
        // init the array(s).
        let innerArray: Array<SelectItemMenuChoices> = [];
        // main loop
        for (let j: number = 0; j < columnAmount; j++) {
            i = 0;
            // default next and back reset for each column.
            innerArray = [];
            
            if (j < columnAmount - 1) {
                innerArray.push({
                    "label": `Next Page ${j + 1}/${columnAmount}`,
                    "emoji": "➡️",
                    "value": i.toString(),
                    "route": "nextInventoryPage"
                })
                i++;
            }
            if (j > 0) {
                innerArray.push({
                    "label": `Go Back a Page ${j + 1}/${columnAmount}`,
                    "emoji": "⬅️",
                    "value": i.toString(),
                    "route": "backInventoryPage"
                })
                i++;
            }        
            
            // for every 23 items since 25 is the max and we need 2 slots for moving.
            totalMax = (maxPerColumn + i);
            while (i < (totalMax)) {
                // to stop out of bound error.
                if (INVENTORY.length - 1 < invI) break;
                // get the current item in iteration.
                const CUR_ITEM = INVENTORY[invI];
                // next item cycle.
                invI++;
                 // push item into array.
                innerArray.push({
                    "label": CUR_ITEM.formattedOutputNoMarkUp || "???",
                    "description": CUR_ITEM?.basic.description || "???",
                    "item": CUR_ITEM.basic,
                    "emoji": CUR_ITEM?.basic.emoji || "📦",
                    "route": null,
                    "value": i.toString()
                })
                console.log("Added to cart: " + CUR_ITEM.basic.name)
                i++;
            }
            // push the rows into the column if it's not just the defaults.       
            ret.push(innerArray);  
        }
        // return result
        return ret;
        
    }
}