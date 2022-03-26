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

    get formattedOutput() {
        const grade = (typeof this.basic.grade == "number" ? EngineUtils.convertNumberToRarity(this.basic.grade) : this.basic.grade);
        return `${this.basic.name} Grade - ${grade}`;
    }

    get formattedOutputNoMarkUp() {
        return this.formattedOutput.replace(/\*/g, "")
    }

}