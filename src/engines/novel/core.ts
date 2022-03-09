//imports

import { Image, NodeCanvasRenderingContext2DSettings } from "canvas";
import { CommandInteraction, Message, MessageAttachment } from "discord.js";
import sharp, { Sharp } from "sharp";
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
        for (let SINGLES of this.multiples as Array<NovelSingle>) {
            SINGLES.built = await this.buildSinglet(SINGLES.i)
            await this.interaction.channel.send({
                attachments: [],
                files: [
                    SINGLES.built
                ]
            })
        }

    }

    /**
     * Name | buildSinglet
     * Desc | Makes the prepared assets of singles into Images.
     * @param i | Index to build.
     */
    private async buildSinglet(i: number = 0): Promise<MessageAttachment> {
        // timer
        console.time("BUILD_" + i);

        // variables.
        let single = this.multiples[i] as NovelSingle;
        const CUSTOM_ID = "NOVEL" + "_" + single.i + "_" + single.type.display.toUpperCase() + "_"+ "_USERID_" + this.interaction.user.id + "." + "jpeg"; // file name.

        // redundant filters. So we don't waste power on drawing the same image.
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
        // draw the background.
        let CANVAS = this.loadedImageBackgrounds.get(single.bg.id).resize(this.X, this.Y) 
        // Since this is a wallpaper display, it only will show the background.
        if (single.type.display === "wallpaper") {
            console.log("wallpaper")
            // set the property to show that it is built and attach the MessageAttachment.
            console.timeEnd("BUILD_" + i);
            // return built image.
            return new MessageAttachment(await CANVAS.toBuffer(), CUSTOM_ID);
        }
        // duet display.
        if (single.type.display === "duet") {
            console.log("duet")
            // edge cases.
            if (single.ch.length != 2) throw new NovelError("Duet characters more than two in array.")
            // Define constant variables for use later.
            const POSITIONX: Array<number> = [30, 390], POSITIONY: number = 130;
            // For compositing images.
            let IMGARR: Array<Sharp> = []

            // Loop block. Resize, grayscale.
            for (let i = 0; i < 2; i++) {
                // load the image.
                let IMAGE = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(single.ch[i].id, single.ch[i].mood))
                // Resize Image.
                IMAGE.resize({width: 270, fit: sharp.fit.contain})
                // Grayscale the image if the character image is not the one talking.
                if (single.txt.speaker !== i) IMAGE.grayscale(true)
                // Push the image into the composite array.
                IMGARR.push(IMAGE)
            }

            // Final output block.                           
            CANVAS.composite([{ input: await IMGARR[0].toBuffer(), left: POSITIONX[0], top: POSITIONY}, { input: await IMGARR[1].toBuffer(), left: POSITIONX[1], top: POSITIONY}])
            // Set the built parameter with the Message Attachment.
            // Log end time.
            console.timeEnd("BUILD_" + i);
            
            // return
            return new MessageAttachment(await CANVAS.toBuffer(), CUSTOM_ID);
        }

        // Finally the default normal display.
        console.log("normal")
        let IMAGE = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(single.ch[0].id, single.ch[0].mood))
        IMAGE.resize({width: 290, fit: sharp.fit.contain})
        // if it is a monologue, since the 'mc' is talking we gray out the ch.
        if (single.txt.speaker == "monologue") IMAGE.grayscale(true)
        // overlay the image ontop of the background.          So there is no space in the bottom.
        CANVAS.composite([{input: await IMAGE.toBuffer(), gravity: sharp.gravity.south}])
        // complete the timer.
        console.timeEnd("BUILD_" + i);
        // return the attachment.
        return new MessageAttachment(await CANVAS.toBuffer(), CUSTOM_ID);
    }
}