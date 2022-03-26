// imps

import { ButtonInteraction, CommandInteraction, InteractionCollector, Message, MessageActionRow, MessageAttachment, MessageButton, MessageButtonOptions, MessageSelectMenu, MessageSelectMenuOptions, WebhookEditMessageOptions } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import sharp from "sharp";
import { CharacterInteractions } from "../../types/models/characters";
import { BaseSingle, NovelSingle, Story } from "../../types/models/stories";
import { ChInUser } from "../../types/models/users";
import { EngineUtils } from "../../utilities/engineUtilities/utils";
import { EngineError, NovelError } from "../../utilities/errors/errors";
import Queries from "../../utilities/mongodb/queries";
import EngineBase from "../base";
import Character from "../classes/characters";
import NovelCore from "../novel/core";

// author = shokkunn

export default class TomoCore extends EngineBase {
    public index: number = 0;
    private LIMIT: number = 8;
    private coreHandler: NovelCore;
    private chInUser: Array<ChInUser>;
    constructor (
        interaction: CommandInteraction,
        multiples: Array<BaseSingle>,
        chInUser: Array<ChInUser>
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
        this.chInUser = chInUser;
        this.once("loaded", async () => this._prepareNodes())
    }

    /**
     * @name start
     * @description starts the cog, sets the page and create collecctors.
     */
     public async start() {
        await this.setPage(0)
        this.message = await this.interaction.fetchReply() as Message<boolean>;
        // if we don't have any button collectors initialized.
        if (!this.buttonCollector) {
            // create and set that collector.
            this.buttonCollector = this._createCollector("BUTTON", 1) as InteractionCollector<ButtonInteraction>;
            // listen to it.
            this._collectButton();
        }
        /*
        // if we don't have any select collectors initialized.
        if (!this.selectCollector) {
            // create that collector.
            this.selectCollector = this._createCollector("SELECT_MENU") as InteractionCollector<SelectMenuInteraction>
            // listen to it.
            this._collectSelect();
        }
        */
    }
    /**
     * @name setPage
     * @description sets the page to the to parameter.
     * @param to index you want to travel to.
     * @returns void
     */
    public async setPage(to: number) {
        // Edge cases.
        if (to < 0 || to > this.multiples.length - 1) return;
        // call function to declare that the page is changing
        this.pageChange(this.multiples[to])
        // set this as new index.
        this.index = to;
        // Declare Constants.
        const CURRENT = this.multiples[this.index],   
        // Grab character form cache.
        CHARACTER = this.cachedCharacters.get(CURRENT.ch[0].id),
        // testing placeholder.
        CONTENT: string = `TESTING | NODE ${this.index} NAME: ${CHARACTER.basic.name}`,
        // configure the payload.
        PAYLOAD: WebhookEditMessageOptions = {
            files: [ CURRENT.built ? 
                CURRENT.built : await this._buildNode(this.index) ],
            content: CONTENT,
            attachments: [],
            components: await this._action(),
        }
        // incase the interaction is replied, we then just edit the reply.
        if (this.interaction.replied) await this.interaction.editReply(PAYLOAD);
        // if its not replied we repl.
        else await this.interaction.reply(PAYLOAD);
        // prevent overflow error.
        if (to == this.multiples.length - 1) return;
        // since user has shown activity, we refresh CD.
        this.refreshCoolDown()
    }
    
    /** Buttons */
    private async _info(index: number = this.index) {
        console.log("_info")

    }

    private async _interact(index: number = this.index) {
        // declare
        
        let CHARACTER = this.cachedCharacters.get(this.multiples[index].ch[0].id);
        let STORY: Story;

        // if its not a normal mood.
        if (this.chInUser[index].stats.mood.current != 0) {
            const PAYLOAD = await Queries.characterBasicVariant(CHARACTER._id as number, EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current))
            CHARACTER = new Character(PAYLOAD._id as number, PAYLOAD, CHARACTER.skins, await Queries.character(PAYLOAD.pointers.interaction, "interactions") as CharacterInteractions);
        };

        STORY = await Queries.story(CHARACTER.basic.stories.base[0]);
        
        let SELECTED_STORY: Story;

        this.coreHandler = new NovelCore(this.interaction, STORY.multiples);

        this.coreHandler.once("ready", () => {
            this.coreHandler.start();
        })
        

        //console.log(EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current))
        
        this.coreHandler.once("userSelectionConfirmed", async (i, selection) => {
            // edge case.
            if (i != 0) throw new EngineError("Tomo", "Novel gave event \'userSelectionConfirmed\' at another index that is not \'0\'. ")
            
            switch (selection) {
                // gift
                case 0:
                    SELECTED_STORY = await CHARACTER.getStoryFromDB(CHARACTER._id as number, EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current), "gift")
                    break;
                // talk
                case 1:
                    SELECTED_STORY = await CHARACTER.getStoryFromDB(CHARACTER._id as number, EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current), "interact")
                    break;

            }

            //console.log(SELECTED_STORY);
            this.coreHandler.appendToMultiples(SELECTED_STORY.multiples, true)
            

        })
        
        

        console.log("_interact")

    }
    private async _danger(index: number = this.index) {
        console.log("_danger")
    }
    /** Buttons End */

    private async _collectButton() {
        // edge cases.
        if (!this.buttonCollector) throw new EngineError("Tomo", "There is no button collector attached to the message. (collectButton)");
        // once the collector gets something and makes it through the filter:
        this.buttonCollector.once("collect", (buttonInteraction: ButtonInteraction) => {
            // Extract button # from the customID.
            const BUTTON = parseInt(buttonInteraction.customId.match(/(\d{1,1})/g)[0]);
            // Emit button pressed event
            this.emit("buttonEvent", BUTTON, this.index);
            console.log(BUTTON)
            
            switch (BUTTON) {
                // 0 is info.
                case 0:
                    return this._info()
                case 1:
                // 1 is intearact.
                    return this._interact()
                case 2:
                // 2 is danger.
                    return this._danger()

                    
            }
        })        
    }
    private async _prepareNodes() {
        // set a limit incase it passes us like a lot of singles.
        for (const singlet of this.multiples) {
            // if limit reached, return.
            if (singlet.i >= this.LIMIT) throw new EngineError("Tomo", "Limit reached on Tomo multiples. (_prepareNodes)");
            // build.
            singlet.built = await this._buildNode(singlet.i);
        }
        this.ready();
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
                style: MessageButtonStyles.DANGER
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