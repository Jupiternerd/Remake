//imports

import { NodeCanvasRenderingContext2DSettings } from "canvas";
import { CommandInteraction, MessageAttachment } from "discord.js";
import { NovelSingle } from "../../types/models/stories";
import AssetManagement from "../../utilities/assetManagement/assetUtililties";
import { EngineUtils } from "../../utilities/engineUtilities/utils";
import { NovelError } from "../../utilities/errors/errors";
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
             ["bg", "ch", "backable", "type"]
            );   
    }

    public async stageTwo() {
        for (const SINGLES of this.multiples as Array<NovelSingle>) this.buildSinglet(SINGLES.i)
    }

    /**
     * Name | buildSinglet
     * Desc | Makes the prepared assets of singles into Images.
     * @param i | Index to build.
     */
    private async buildSinglet(i: number = 0) {
        // timer
        console.time("BUILD_" + i);

        // variables.
        let single = this.multiples[i] as NovelSingle, ctx = this.canvas.getContext("2d"), quality: object = {quality: 0.5};
        const CUSTOM_ID = "NOVEL" + "_" + single.i + "_" + single.type.display.toUpperCase() + "_"+ "_USERID_" + this.interaction.user.id + ".jpeg"; // file name.
        
        // quality.
        ctx.quality = ctx.patternQuality = "fast";

        // redundant filters.
        const SIMILAR_NODE: NovelSingle = this.multiples.find((node: NovelSingle) => 
            (node.built != undefined) && // is it built?
            (node.type.display == single.type.display) && // if there are nodes that have the same display type.
            (node.ch == single.ch) && // same characters.
            (node.txt.speaker == node.txt.speaker) && // same speaker.
            (node.bg.id == single.bg.id)) // and same background.

        // if we do find one.
        if (SIMILAR_NODE) {
            single.built = SIMILAR_NODE.built;
            console.log("Found Similar Node");
            console.timeEnd("BUILD_" + i);
            return single.built;
        }

        // I read somewhere that calling this before pasting a png makes it go "faster". 
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw the background.
        ctx.drawImage(this.loadedImageBackgrounds.get(single.bg.id), 0, 0, this.canvas.width, this.canvas.height);

        // Since this is a wallpaper display, it only will show the background.
        if (single.type.display === "wallpaper") {
            console.log("wallpaper")
            // set the property to show that it is built and attach the MessageAttachment.
            single.built = new MessageAttachment(this.canvas.toBuffer("image/jpeg", quality), CUSTOM_ID) 
            console.timeEnd("BUILD_" + i);
            // return built image.
            return single.built;
        }

        // duet display.
        if (single.type.display === "duet") {
            console.log("duet")
            // edge cases.
            if (single.ch.length != 2) throw new NovelError("Duet characters more than two in array.")
            // define constant properties.
            const POSITIONS: Array<number> = [30, 390], CONSTY: number = 130;

            for (let i = 0; i < 2; i++) {
                // Get image object.
                const IMAGE = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(single.ch[i].id, single.ch[i].mood));

                // Draw characters 
                ctx.drawImage(IMAGE, 0, 0, 0, 0, POSITIONS[i], CONSTY, IMAGE.naturalWidth, IMAGE.naturalHeight)
            }

            single.built = new MessageAttachment(this.canvas.toBuffer("image/jpeg", quality), CUSTOM_ID) 

            await this.interaction.channel.send({
                files: [
                    single.built
                ],
                attachments: []
            })



            
            





        }

        // normal display.



        console.timeEnd("BUILD_" + i);
    }

    
}