//imports
import { ButtonInteraction, CommandInteraction, InteractionCollector, Message, MessageActionRow, MessageAttachment, MessageButton, MessageButtonOptions, MessageSelectMenu, MessageSelectMenuOptions, SelectMenuInteraction, WebhookEditMessageOptions } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import sharp, { Sharp } from "sharp";
import { DialogueScript, NovelScript, NovelSingle } from "../../types/models/stories";
import { EngineUtils, MathUtils, StringUtils } from "../../utilities/engineUtilities/utils";
import { NovelError } from "../../utilities/errors/errors";
import EngineBase from "../base";
import Character from "../classes/characters";

// author = shokkunn

/**
 * Name | NovelCore
 * Desc | Novel engine.
 */
export default class NovelCore extends EngineBase {
    // index for keeping track of our location in the multipes.
    public index: number = 0;
    private LIMIT: number = 40;
    declare multiples: Array<NovelSingle>
    // internal tracker for selection.
    protected selection: number
    public constructor(
        interaction: CommandInteraction,
        multiples: Array<NovelSingle>,
        ) {
        super(interaction,
            {
                x: 724,
                y: 480,
                timeout: 80000
            },
             multiples,
             ["bg", "ch", "backable", "type"]
            );
        // When all assets have been loaded, run this:
        this.once("loaded", async () => this.prepareNodes())
    }

    /**
     * @name prepareNodes
     * @description loops through the nodes to build them.
     * @emits ready when it has built everything.
     */
    public async prepareNodes() {
        // built the nodes.
        for (let SINGLES of this.multiples as Array<NovelSingle>) {
            if (SINGLES.i >= this.LIMIT) throw new NovelError("Multiples limit reached. (prepareNodes)");
            SINGLES.built = await this._buildSinglet(SINGLES.i);
        }
        // set ready.
        this.ready()
    }
    /**
     * @Name | buildSinglet
     * @Desc | Makes the prepared assets of singles into Images.
     * @param i | Index to build.
     */
     protected async _buildSinglet(i: number = 0): Promise<MessageAttachment> {
        // timer
        //console.time("BUILD_" + i);

        // variables.
        let single = this.multiples[i] as NovelSingle, IMAGE: Sharp, CANVAS: Sharp, iC: number = 0;

        // Set custom novel id.
        const CUSTOM_ID = "NOVEL" + "_" + single.i + "_" + single.type.display.toUpperCase() + "_"+ "_USERID_" + this.interaction.user.id + "." + "webp", QUALITY = {quality: 24, alphaQuality: 40} // file name.

        // redundant filters. So we don't waste power on drawing the same image.
        const SIMILAR_NODE: NovelSingle = this.multiples.find((node: NovelSingle) => 
            (node.built != undefined) && // is it built?
            (node.type.display === single.type.display) && // if there are nodes that have the same display type.
            (node.ch === single.ch) && // same characters.
            (node.txt.speaker === single.txt.speaker) && // same speaker.
            (node.bg.id === single.bg.id)) // and same background.

        // if we do find one.
        if (SIMILAR_NODE) {
            single.built = SIMILAR_NODE.built;
            //console.log("Found Similar Node");
            //console.timeEnd("BUILD_" + i);
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
            //console.log("wallpaper")
            // set the property to show that it is built and attach the MessageAttachment.
            //console.timeEnd("BUILD_" + i);
            // return built image.
            return new MessageAttachment(await CANVAS.webp(QUALITY).toBuffer(), CUSTOM_ID);
        }
        // duet display.
        if (single.type.display === "duet") {
            //console.log("duet")
            // edge cases.
            if (single.ch.length != 2) throw new NovelError("Duet characters more than two in array.")
            // Define constant variables for use later.
            const POSITIONX: Array<number> = [30, 390], POSITIONY: number = 130;
            // For compositing images.
            let IMGARR: Array<{input: Buffer, left: number, top: number}> = []

            // Loop block. Resize, grayscale.
            for (iC = 0; iC < 2; iC++) {
                // load the image.
                try {
                    // get the image from the cache.
                    IMAGE = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(single.ch[iC].id, single.ch[iC].mood))
                } catch(error) {
                    throw new NovelError("Could not get Character of novel. (Duet)")
                }
                // Resize Image.
                IMAGE.resize({width: 270, fit: sharp.fit.contain})
                // Grayscale the image if the character image is not the one talking.
                if (single.txt.speaker == iC) IMAGE.grayscale(false); else IMAGE.grayscale(true);
                // Push the image into the composite array.
                IMGARR.push({
                    input: await IMAGE.webp(QUALITY).toBuffer(),
                    left: POSITIONX[iC],
                    top: POSITIONY
                })
            }
            // Final output block.                           
            CANVAS.composite(IMGARR)
            // Log end time.
            //console.timeEnd("BUILD_" + i);
            // return
            return new MessageAttachment(await CANVAS.webp(QUALITY).toBuffer(), CUSTOM_ID);
        }

        // Finally the default normal display.
        //console.log("normal")
        // get the image from the cache.
        try {
            // Since ic will always be 0, we don't have to just put in 0.
            IMAGE = this.loadedImageCharacters.get(EngineUtils.getCharacterCacheKey(single.ch[0].id, single.ch[0].mood))
        } catch(error) {
            throw new NovelError("Could not get Character of novel. (Normal)")
        }
        IMAGE.resize({width: 290, fit: sharp.fit.contain})
        // if it is a monologue, since the 'mc' is talking we gray out the ch.
        if (single.txt.speaker == "monologue" || single.txt.speaker == "user") IMAGE.grayscale(true); else IMAGE.grayscale(false);
        // overlay the image ontop of the background. 
        CANVAS.composite([{input: await IMAGE.toBuffer(), gravity: sharp.gravity.south}]) // Gravity to south so there is no space in the bottom.
        // complete the timer.
        //console.timeEnd("BUILD_" + i);
        // return the attachment.
        return new MessageAttachment(await CANVAS.webp(QUALITY).toBuffer(), CUSTOM_ID);
    }  

    /**
     * @name _characterSpeakString
     * @description prettifies the message content to send back to the user.
     * @returns {string} of message content.
     */
    private _characterSpeakString(): string {
        // Get the current slide.
        const CURRENT: NovelSingle = this.multiples[this.index]
        // Edge case.
        if (CURRENT.txt.speaker == "monologue") return `>>> ${StringUtils.periodTheString(CURRENT.txt.content)}`;
        if (CURRENT.txt.speaker == "user") return `>>> You • ${StringUtils.periodTheString(CURRENT.txt.content)}`
        // Parse the script.
        const CHARACTER: Character = this.cachedCharacters.get(CURRENT.ch[CURRENT.txt.speaker].id),
        SANITIZED_CONTENT: string = StringUtils.periodTheString(CURRENT.txt.content.startsWith("$") ? this._parseDialogue(CURRENT.txt.content as DialogueScript) : CURRENT.txt.content)
        // format and return the string.
        return `>>> ${CHARACTER.basic.emoji} ${CHARACTER.basic.name} • ` + SANITIZED_CONTENT;
    }

    /**
     * @name _clearMenuActionRows
     * @description clears the actionrows.
     */
    private async _clearMenuActionRows() {
        // clear everything in the components.
        if (this.message) await this.interaction.editReply({components: []})
    }

    /**
     * @name _action
     * @description provides actionRow.
     * @returns MessageActionRow[]
     */
    private async _action(): Promise<MessageActionRow[]> {
        switch(this.multiples[this.index].type.special?.type) {
            case "normal":
                return await this._normalInteractRow();
            case "selection":
                return await this._selectInteractRow();
            case "timed":
                await this._timedInteract()
                return [];
            default:
                return await this._normalInteractRow();
        }
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
            this.buttonCollector = this._createCollector("BUTTON") as InteractionCollector<ButtonInteraction>;
            // listen to it.
            this._collectButton();
        }
        // if we don't have any select collectors initialized.
        if (!this.selectCollector) {
            // create that collector.
            this.selectCollector = this._createCollector("SELECT_MENU") as InteractionCollector<SelectMenuInteraction>
            // listen to it.
            this._collectSelect();
        }
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
        // configure the payload.
        const payload: WebhookEditMessageOptions = {
            files: [ this.multiples[this.index].built ? 
            this.multiples[this.index].built : await this._buildSinglet(this.index) ],
            content: this._characterSpeakString(),
            attachments: [],
            components: await this._action(),
        }
        // incase the interaction is replied, we then just edit the reply.
        if (this.interaction.replied) await this.interaction.editReply(payload);
        // if its not replied we repl.
        else await this.interaction.reply(payload);
        // prevent overflow error.
        if (to == this.multiples.length - 1) return this.end();
        // since user has shown activity, we refresh CD.
        this.refreshCoolDown()
    }

    /** Interaction with User */
    /**
     * @name collectButton
     * @description | collects the button component and processes the request.
     */
    private async _collectButton(): Promise<void> {
        // edge cases.
        if (!this.buttonCollector) throw new NovelError("There is no button collector attached to the message. (collectButton)");
        // once the collector gets something and makes it through the filter:
        this.buttonCollector.on("collect", (buttonInteraction: ButtonInteraction) => {
            // Get current index.
            const CURRENT: NovelSingle = this.multiples[this.index]            
            // Extract button # from the customID.
            const BUTTON = parseInt(buttonInteraction.customId.match(/(\d{1,1})/g)[0]);
            // Edge cases.
            if (!CURRENT.type?.hasOwnProperty("special")) return this._normalInteract(BUTTON);
            // Emit button pressed event
            this.emit("buttonEvent", BUTTON, this.index);
    
            // Switch case pointing towards the special type respective functions.
            switch(CURRENT.type.special.type) {
                case "normal": 
                // normal
                    this._normalInteract(BUTTON);
                    break;
                case "selection":
                // select menu
                    this._selectInteract(BUTTON);
                    break;
                case "timed":
                // no buttons or select, just time.
                    this._timedInteract(BUTTON);
                    break;
                default:
                // normal
                    this._normalInteract(BUTTON);
                    break;
            }
        })
    }

    /**
     * @name _collectSelect
     * @description collects the select menu selection.
     */
    private async _collectSelect(): Promise<void> {
        // edge case.
        if (!this.selectCollector) throw new NovelError("There is no select collector attached to the message. (colelctSelect)");
        // collection.
        this.selectCollector.on("collect", async (selectInteraction: SelectMenuInteraction) => {
            // set this as the selection.
            this.selection = parseInt(selectInteraction.values[0]);
            // emit event.
            this.emit("selectEvent", this.selection, this.index);
            // edit the message to reflect the selection.
            this.interaction.editReply({components: await this._selectInteractRow()})
        })
    }

    /** Interaction type functions (normal, timed, selection) */

    /**
     * @name _normalInteractRow
     * @description capsulizes normal buttons to be used in components.
     * @returns {Array<MessageActionRow>} Array of message action row.
     */
    private async _normalInteractRow(): Promise<Array<MessageActionRow>> {
        // define return and iterator.
        let ret: Array<MessageActionRow> = [];
        // buttonRow.
        const BUTTONROW = new MessageActionRow();
        // define the buttons for the message action row.
        const BUTTONS: MessageButtonOptions[] = [
            // Go back button.
            {
                customId: "NOVEL.button_" + "0" + "_user_" + this.interaction.user.id,
                disabled: (this.index > 0 ? false : true) || !(this.multiples[this.index].backable),
                label: "Back",
                style: MessageButtonStyles.PRIMARY
            },
            // Next Button.
            {
                customId: "NOVEL.button_" + "1" + "_user_" + this.interaction.user.id,
                disabled: (this.index >= this.multiples.length - 1 ? true : false),
                label: "Next",
                style: MessageButtonStyles.PRIMARY,
            },
            // Exit button. Holding off until I decide what to add.
        ]
        // Add the buttons to the button row.
        for (const button of BUTTONS) BUTTONROW.addComponents(new MessageButton(button))
        // Finally push the buttonrow to the action row.
        ret.push(BUTTONROW);
        // Return.
        return ret;
    }

    /**
     * @name _selectInteractRow
     * @description Provides select menu and buttons.
     * @returns {Array<MessageActionRow>} Messagae action rows
     */
    private async _selectInteractRow(): Promise<Array<MessageActionRow>> {
        // Define 
        let row: Array<MessageActionRow> = [], BUTTONROW = new MessageActionRow(), SELECTROW = new MessageActionRow()
        // Button
        const BUTTON: MessageButtonOptions = {
                customId: "NOVEL.button_" + "2" + "_user_" + this.interaction.user.id,
                label: "Confirm",
                style: MessageButtonStyles.SUCCESS
            },
        // Select Menu
        SELECT_MENU: MessageSelectMenuOptions = {
            // If this single has it's own default place holder. If not provide our own.
            // Also if there is a selection we will put the selection as the label.
            placeholder: this.selection == undefined ? (this.multiples[this.index].type.special.default ? this.multiples[this.index].type.special.default : "Select an option") : this.multiples[this.index].type.special.choices[this.selection].label,
            customId: "NOVEL.select_" + "0" + "_user_" + this.interaction.user.id,
            options: this.multiples[this.index].type.special.choices
        }
        // Add the components to their respective rows.
        BUTTONROW.addComponents(new MessageButton(BUTTON))
        SELECTROW.addComponents(new MessageSelectMenu(SELECT_MENU))
        // Push all the rows into the array to send back.
        row.push(SELECTROW, BUTTONROW)
        // Return.
        return row;
    }

    /**
     * @name _normalInteract
     * @description function that gets called when interaction gets called.
     * @param button number that got passed to the bot.
     */
    private async _normalInteract(button?: number): Promise<void> {
        switch(button) {
            // This is the back button.
            case 0:
                this.setPage(this.index - 1)
                break;
            // Next button.
            case 1:
                this.setPage(this.index + 1)
                break;
            default:
                break;
        }
    }

    /**
     * @name _timedInteract
     * @description functiom that gets caled when the interaction gets called.
     * @param button number that got passed.
     */
    private async _timedInteract(button?: number): Promise<void> {
        // clear all the things in the action rows.
        await this._clearMenuActionRows();
        // Get the timeout.
        const TIMEOUT: number = this.multiples[this.index].type?.special?.wait || 5000;
        // wait out the timeout. Then call the setPage.
        setTimeout(async () => await this.setPage(this.index + 1), TIMEOUT)
    }

    /**
     * @name _selectInteract
     * @description functino that gets caled when the interaction gets called.
     * @param BUTTON number that got passed.
     */
    private async _selectInteract(BUTTON?: number): Promise<void> {
        // If the user has made a choice and the button is equal to the state we set at the begining (confirm button)
        if (BUTTON == 2 && this.selection != undefined) { // User has confirmed their selection.
            // call that the user has made a selection.
            this.emit("userSelectionConfirmed", this.index, this.selection);          
            // Get the route (script or index) of the selected option.
            const ROUTE = this.multiples[this.index].type.special.choices[this.selection].route;
            // clear the selection.
            this.selection = undefined;            
            // If the route is a number, we assume they want to travel to that index in the novel.
            if (typeof ROUTE == "number") return await this.setPage(ROUTE);
            // If the route is a script (string), we leave the parseScript function to handle it.
            if (typeof ROUTE == "string") return await this._parseScript(ROUTE);
        }
    }

    /** Utility Methods */

    /**
     * @name _parseScript
     * @description parses the novel script and points it to.
     * @param {NovelScript} script the script you want to parse.
     * @returns void
     */
    private async _parseScript(script: NovelScript) {
        switch (script) {
            // If the script says to go back.
            case "back": return await this.setPage(this.index - 1);
            // forward.
            case "next": return await this.setPage(this.index + 1);
        }
    }
    /**
     * @name _parseDialgue
     * @description gets a string and character. Then sees if the string is a script. Then 
     * @param script that you want to parse.
     * @returns the appropriate response.
     */
    private _parseDialogue(script: DialogueScript) {
        // delete the $ in the begining.
        script = script.substring(1) as DialogueScript;
        // get the character to get reference of script.
        const CHARACTER = this.cachedCharacters.get(this.multiples[this.index].ch[this.multiples[this.index].txt.speaker].id);
        // switch case to get the dialogue.
        switch(script) {
            case "farewells": return CHARACTER.baseReactions.farewells[MathUtils.randIntFromZero(CHARACTER.baseReactions.farewells.length)]
            case "greetings": return CHARACTER.baseReactions.greetings[MathUtils.randIntFromZero(CHARACTER.baseReactions.greetings.length)]
            default: return script;
        }
    }
    
    /**
     * @name appendToMultiples
     * @description appends more novel singles to the array.
     * @param {NovelSingle} multiple that you want to append to the array.
     */
    public async appendToMultiples(multiple: Array<NovelSingle>) {
        this.multiples.concat(multiple)
        await this.cacheAssets();
    }

}