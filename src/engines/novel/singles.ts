//imports
import { Single, SingleTypes } from "../../types/models/stories";

// author = shokkunn

/**
 * Name | Singles
 * Desc | Butchers the long multiples into single Singles.
 */
export default class Singles implements Single {
    type: SingleTypes = "normal";
    i: number
    constructor(
        single: Single,
        index: number
    ) {
        this.i = (single.hasOwnProperty("i") ? single.i : index) // If the single comes with no index, we will provide it.

        

    }
}