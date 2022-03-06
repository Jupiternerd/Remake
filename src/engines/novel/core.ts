//imports

import { CommandInteraction } from "discord.js";
import { Single } from "../../types/models/stories";
import EngineBase from "../base";

// author = shokkunn

export default class TomoCore extends EngineBase {
    constructor(
        interaction: CommandInteraction,
        private multiples: Array<Single>
        ) {
        super(interaction,
            {
                x: 724,
                y: 480
            });
        
        this.prepareAssets()
    }

    private async prepareAssets() {
        

    }



    



}