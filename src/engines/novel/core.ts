//imports

import { CommandInteraction } from "discord.js";
import { BaseSingle, NovelSingle } from "../../types/models/stories";
import EngineBase from "../base";

// author = shokkunn

/**
 * Name | NovelCore
 * Desc | Novel engine.
 */
export default class NovelCore extends EngineBase {
    constructor(
        interaction: CommandInteraction,
        multiples: Array<NovelSingle>,

        ) {
        super(interaction,
            {
                x: 724,
                y: 480,

            },
             multiples,

            );
        
    }




    



}