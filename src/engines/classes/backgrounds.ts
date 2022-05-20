//imp

import { ColorResolvable, MessageEmbed } from "discord.js";
import { GradeColor } from "../../types/local/static";
import { BackgroundBasic } from "../../types/models/backgrounds";
import { EngineUtils } from "../../utilities/engineUtilities/utils";
import UniBase from "./base";

// auth = shokkunn

export default class Background extends UniBase {
    /**
     * Name | Background
     * Desc | encapsulates basic background class.
     * @param basic 
     */
    declare basic: BackgroundBasic
    constructor(id: number, basic: BackgroundBasic) {
        super(id, basic)
        this.basic = basic;
    }
    
    /**
     * @name getInfoOutput
     * @returns the message embed to use in 
     */
    get getInfoOutput() {
        return super.getInfoOutput
    }
}