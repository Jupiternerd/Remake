//imp

import { basic } from "../../types/local/static";
import { EngineUtils } from "../../utilities/engineUtilities/utils";

// author = shokkunn

export default abstract class UniBase {
    _id: number | string;
    basic: basic;

    constructor(_id: number | string, basic?: basic) {
        this._id = _id;
        this.basic = basic;

    }

    /**
     * @returns a markedup version of the formatted name.
     */
    get formattedOutput() {
        const grade = (typeof this.basic.grade == "number" ? EngineUtils.convertNumberToRarity(this.basic.grade) : this.basic.grade);
        return `${this.basic.name} | Grade · ${grade}`;
    }

    /**
     * @returns a no markup version of the formatted name.
     */
    get formattedOutputNoMarkUp() {
        return this.formattedOutput.replace(/\*/g, "")
    }

}