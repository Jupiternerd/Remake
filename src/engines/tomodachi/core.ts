// imps

import { CommandInteraction, Message, MessageActionRow, MessageAttachment, MessageButton, MessageButtonOptions, MessageSelectMenu, MessageSelectMenuOptions } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import sharp from "sharp";
import { BaseSingle } from "../../types/models/stories";
import { EngineUtils } from "../../utilities/engineUtilities/utils";
import { EngineError, NovelError } from "../../utilities/errors/errors";
import EngineBase from "../base";
import NovelCore from "../novel/core";

// author = shokkunn

export default class TomoCore extends EngineBase {
    public index: number = 0;
    private LIMIT: number = 8;
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

    private async _prepareNodes() {
        // set a limit incase it passes us like a lot of singles.
        for (const singlet of this.multiples) {
            // if limit reached, return.
            if (singlet.i >= this.LIMIT) throw new EngineError("Tomo", "Limit reached on Tomo multiples. (_prepareNodes)");
            // build.
            singlet.built = await this._buildNode(singlet.i);
        }
    }
    /**
     * @name _buildNode
     * @description builds nodes as message attachments to send to discord.
     */
    private async _buildNode(i: number): Promise<MessageAttachment> {
        // Constant variables.
        const CURRENT = this.multiples[i],  QUALITY: sharp.WebpOptions = {quality: 24, alphaQuality: 40}, CUSTOM_ID = "TOMO" + "_" + i + "_" + "_USERID_" + this.interaction.user.id + "." + "webp",
        // Get background.
        BACKGROUND = this.loadedImageBackgrounds.get(EngineUtils.getBackgroundCacheKey(CURRENT.bg.id, CURRENT.bg.blurred)),
        // Get characer.
        FOREGROUND = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(CURRENT.ch[0].id, CURRENT.ch[0].mood));

        // Image manipulation phase.
        BACKGROUND.resize({ width: this.X, height: this.Y})
        FOREGROUND.resize({width: 290, fit: sharp.fit.contain})

        // Overlaying Image phase.
        BACKGROUND.composite([{input: await FOREGROUND.toBuffer(), gravity: sharp.gravity.south}])

        // Returning as Message attachment.
        return new MessageAttachment(await BACKGROUND.webp(QUALITY).toBuffer(), CUSTOM_ID)
    }
    
    private async _action(): Promise<Array<MessageActionRow>> {
        // Define 
        let row: Array<MessageActionRow> = [], BUTTONROW = new MessageActionRow()//, SELECTROW = new MessageActionRow()
        // Button
        const BUTTONS: MessageButtonOptions[] = [{
                customId: "TOMO.button_" + "0" + "_user_" + this.interaction.user.id,
                label: "Info",
                style: MessageButtonStyles.SUCCESS
            }, {
                customId: "TOMO.button_" + "1" + "_user_" + this.interaction.user.id,
                label: "Interact",
                style: MessageButtonStyles.PRIMARY
            }, {
                customId: "TOMO.button_" + "2" + "_user_" + this.interaction.user.id,
                label: "Danger",
                style: MessageButtonStyles.SECONDARY
            }]/*,
            
        // Select Menu
        SELECT_MENU: MessageSelectMenuOptions = {
            // If this single has it's own default place holder. If not provide our own.
            // Also if there is a selection we will put the selection as the label.
            placeholder: this.selection == undefined ? (this.multiples[this.index].type.special.default ? this.multiples[this.index].type.special.default : "Select an option") : this.multiples[this.index].type.special.choices[this.selection].label,
            customId: "NOVEL.select_" + "0" + "_user_" + this.interaction.user.id,
            options: this.multiples[this.index].type.special.choices
        }
        */
        // Add the components to their respective rows.
        for (const BUTTON of BUTTONS) BUTTONROW.addComponents(new MessageButton(BUTTON))
        /*
        SELECTROW.addComponents(new MessageSelectMenu(SELECT_MENU))
        */
        // Push all the rows into the array to send back.
        row.push(/*SELECTROW,*/ BUTTONROW)
        // Return the row.
        return row;
    }
}