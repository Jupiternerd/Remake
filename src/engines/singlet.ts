//imports
import { BackgroundCapsule, BaseSingle, CharacterCapsule } from "../types/models/stories";

// author = shokkunn

/**
 * Name | Singles
 * Desc | Butchers the long multiples into single Singles.
 */
export default class Singlet implements BaseSingle {
    public i: number
    public bg?: BackgroundCapsule;
    public ch?: Array<CharacterCapsule>;
    constructor(
        single: BaseSingle,
        index: number,
        ch: Array<CharacterCapsule>,
        bg: BackgroundCapsule
    ) {
        this.i = (single.hasOwnProperty("i") ? single.i : index) // If the single comes with no index, we will provide it.
        this.ch = ch;
        this.bg = bg;

    }
}