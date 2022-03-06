//imp

import { BackgroundBasic } from "../../types/models/backgrounds";
import UniBase from "./base";

// auth = shokkunn

export default class Background extends UniBase {
    /**
     * Name | Background
     * Desc | encapsulates basic background class.
     * @param basic 
     */
    basic: BackgroundBasic
    constructor(basic: BackgroundBasic) {
        super()
        this.basic = basic;
    }

}