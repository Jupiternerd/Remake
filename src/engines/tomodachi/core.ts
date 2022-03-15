// imps

import { CommandInteraction } from "discord.js";
import { BaseSingle } from "../../types/models/stories";
import EngineBase from "../base";
import NovelCore from "../novel/core";

// author = shokkunn

export default class TomoCore extends EngineBase {
    constructor (
        interaction: CommandInteraction,
        multiples: Array<BaseSingle>
    ) {
        super(
            interaction,
            {
                x: 564,
                y: 670,
                timeout: 60000, 
            },
            multiples
        )

        this.once("loaded", async () => this._prepareNodes())
    }

    private _prepareNodes() {

    }
}