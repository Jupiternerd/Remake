// author = shokkunn

// Constants
const EMOJI_CONSTANTS = {
    filledBar: "▰",
    emptyBar: "▱"
}

export class GUI {
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