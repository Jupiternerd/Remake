//imports

import { CommandInteraction, MessageAttachment } from "discord.js";
import sharp, { Sharp } from "sharp";
import { NovelSingle } from "../../types/models/stories";
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
            //console.log(SINGLES)
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
        let single = this.multiples[i] as NovelSingle, IMAGE: Sharp, CANVAS: Sharp
        const CUSTOM_ID = "NOVEL" + "_" + single.i + "_" + single.type.display.toUpperCase() + "_"+ "_USERID_" + this.interaction.user.id + "." + "jpeg"; // file name.

        // redundant filters. So we don't waste power on drawing the same image.
        const SIMILAR_NODE: NovelSingle = this.multiples.find((node: NovelSingle) => 
            (node.built != undefined) && // is it built?
            (node.type.display === single.type.display) && // if there are nodes that have the same display type.
            (node.ch === single.ch) && // same characters.
            (node.txt.speaker === node.txt.speaker) && // same speaker.
            (node.bg.id === single.bg.id)) // and same background.

        // if we do find one.
        if (SIMILAR_NODE) {
            single.built = SIMILAR_NODE.built;
            console.log("Found Similar Node");
            console.timeEnd("BUILD_" + i);
            return single.built;
        }
        // try to get bg.
        try {
            // get bg from cache.
            CANVAS = this.loadedImageBackgrounds.get(EngineUtils.getBackgroundCacheKey(single.bg.id, single.bg.blurred)).resize(this.X, this.Y) 
        } catch(e) {
            // throw if error.
            throw new NovelError("Could not get Background of novel.")
        }
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
            let IMGARR: Array<{input: Buffer, left: number, top: number}> = []

            // Loop block. Resize, grayscale.
            for (let i = 0; i < 2; i++) {
                // load the image.
                try {
                    // get the image from the cache.
                    IMAGE = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(single.ch[i].id, single.ch[i].mood))
                } catch(error) {
                    throw new NovelError("Could not get Character of novel.")
                }
                // Resize Image.
                IMAGE.resize({width: 270, fit: sharp.fit.contain})
                // Grayscale the image if the character image is not the one talking.
                if (single.txt.speaker != i) IMAGE.grayscale(true); else IMAGE.grayscale(false);
                // Push the image into the composite array.
                IMGARR.push({
                    input: await IMAGE.toBuffer(),
                    left: POSITIONX[i],
                    top: POSITIONY
                })
            }
            // Final output block.                           
            CANVAS.composite(IMGARR)
            // Set the built parameter with the Message Attachment.
            // Log end time.
            console.timeEnd("BUILD_" + i);
            // return
            return new MessageAttachment(await CANVAS.toBuffer(), CUSTOM_ID);
        }

        // Finally the default normal display.
        console.log("normal")
        // get the image from the cache.
        try {
            IMAGE = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(single.ch[0].id, single.ch[0].mood))
        } catch(error) {
            throw new NovelError("Could not get Character of novel. (Normal)")
        }
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