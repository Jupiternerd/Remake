// author = shokkunn

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