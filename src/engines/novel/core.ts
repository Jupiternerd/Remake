//imports

import { CommandInteraction } from "discord.js";
import { NovelSingle } from "../../types/models/stories";
import EngineBase from "../base";

// author = shokkunn

/**
 * Name | NovelCore
 * Desc | Novel engine.
 */
export default class NovelCore extends EngineBase {
    constructor(
        interaction: CommandInteraction,
        ) {
        super(interaction,
            {
                x: 724,
                y: 480
            });
        this.prepareAssets()
        this.loadedBackgrounds
    }




    



}