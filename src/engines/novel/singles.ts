//imports
import { NovelSingle } from "../../types/models/stories";

// author = shokkunn

/**
 * Name | Singles
 * Desc | Butchers the long multiples into single Singles.
 */
export default class Singles implements NovelSingle {
    public i: number
    constructor(
        single: NovelSingle,
        index: number
    ) {
        this.i = (single.hasOwnProperty("i") ? single.i : index) // If the single comes with no index, we will provide it.
        

    }
}