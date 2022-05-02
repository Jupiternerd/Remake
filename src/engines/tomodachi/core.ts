// imps

import { ButtonInteraction, CommandInteraction, InteractionCollector, Message, MessageActionRow, MessageAttachment, MessageButton, MessageButtonOptions, MessageSelectMenu, MessageSelectMenuOptions, WebhookEditMessageOptions } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import sharp from "sharp";
import { CharacterInteractions, Reaction } from "../../types/models/characters";
import { Item } from "../../types/models/items";
import { BaseSingle, NovelSingle, SelectItemMenuChoices, Story } from "../../types/models/stories";
import { ChInUser } from "../../types/models/users";
import { EngineUtils, MathUtils } from "../../utilities/engineUtilities/utils";
import { EngineError } from "../../utilities/errors/errors";
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
    private hungerLimit: number = 75;

    // gifting globals.
    private invInGroups: Array<Array<SelectItemMenuChoices>> 
    private currentInvIndex: number;
    constructor (
        interaction: CommandInteraction,
        multiples: Array<BaseSingle>,
        chInUser: Array<ChInUser>
    ) {
        super(
            interaction,
            {
                x: 564,
                y: 700,
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

    /**
     * @name _info
     * @description Shows description of the tomodachi.
     * @param {number} index that the tomo is located in.
     */
    private async _info(index: number = this.index) {
        const CHARACTER = this.cachedCharacters.get(this.chInUser[index]._id as number), 
        SPECIFIC = this.chInUser[index];
        await this.interaction.editReply(
            {
                content: "*Temporary Information Page. Custom Pages soon...*\n" +
                `${CHARACTER.basic.emoji} **${CHARACTER.formattedOutput}**\n` +
                // Actual info
                `Level • ${SPECIFIC.stats.level}\n EXP • ${SPECIFIC.stats.xp} / 100\n Hungry? • ${SPECIFIC.stats.hunger <= this.hungerLimit ? 'yes' : 'no'}\n\n` +
                `Meter • ${SPECIFIC.stats.mood.meter}\n Meter EXP • ${SPECIFIC.stats.mood.meterxp} / 200`,
                attachments: [],
                components: []
            }
            )
    }

    /**
     * @name __gift
     * @description main gift driver function.
     * @param {Character} CHARACTER to comapre to against the gift. 
     */
    private async __gift(CHARACTER: Character) {
        // first, we populate the inventory (with data from item db)
        let response: Reaction;
        const INVENTORY = await this.user.populateTransferableInventory();
        this.currentInvIndex = 0;

        this.invInGroups = await EngineUtils.fillSelectWithInventory(INVENTORY.filter(i => i.giftable == true), 23);
        
        // second, we insert the gift selection node.
        const SELECTION_NODE: NovelSingle[] = [
            {
                "type": {
                    "display": "normal",
                    "special": {
                        "type": "selection",
                        "choices": this.invInGroups[this.currentInvIndex],
                        "default": "Choose an item to gift"
                    }
                }
            }
        ]

        // Append this to the end of the multiples.
        await this.coreHandler.insertToMultiples(SELECTION_NODE);
        await this.coreHandler.cacheAssets();

        // Set it as the page.
        this.coreHandler.setPage(this.coreHandler.multiples[this.coreHandler.index + 1].i)

        // We look out for the gift actions like selection and next page.
        this.coreHandler.on("selectEvent", async (selection, index) => {
            this.coreHandler.refreshCoolDown()
            if (index != this.coreHandler.multiples[this.coreHandler.index].i) return;
            await this.__gift_action(selection)
        })

        // When the user has confirmed the item to gift.
        this.coreHandler.on("userSelectionConfirmed", async (index, selection) => {
            if (index != this.coreHandler.multiples[this.coreHandler.index].i) return;
            console.log("Collected Gift: " + this.invInGroups[this.currentInvIndex][selection].item.name)
            response = await this.__gift_collected(this.invInGroups[this.currentInvIndex][selection].item, CHARACTER)

            // End, we display the end screen. 40 is temporary. (TODO: Alpha)
            await this._endScreen(await this._rewardsCalculation(response), 40);
        })
    }

    private async __gift_collected(gift: Item, CHARACTER: Character) {
        let REACTION_NODE: NovelSingle = {"type": {
            "display": "normal",
            "special": {
                "type": "normal"
            }
        }}, 
        responseDict = CHARACTER.interactions.gifts, specificCharacter = this.chInUser[this.index].stats, 
        response: Reaction,
        column: string;

        // Check if the item grade against the character. 
        if (CHARACTER.basic.grade < gift.grade) column = "aboveTier";
        if (CHARACTER.basic.grade == gift.grade) column = "averageTier";
        if (CHARACTER.basic.grade > gift.grade) column = "belowTier";

        // If the item is hated, this is the second strongest reaction.
        if (specificCharacter.gift.dislikes.includes(gift._id as number)) column = "dislike";

        // Liking something should be the strongest reaction.
        if (specificCharacter.gift.likes.includes(gift._id as number)) column = "like";

        // Unless it's a duplicate.
        if (specificCharacter.gift.recentReceived.findIndex(i => i.itemID == gift._id) >= 0) column = "duplicate";

        // Since Hunger is a special case, we set the response before we check for it.
        response = responseDict[column][MathUtils.randIntFromZero(responseDict[column].length)];

        // Hunger munch munch.
        if (gift?.type == "food") {
            if (specificCharacter.hunger <= this.hungerLimit) response = responseDict["hunger"].food[MathUtils.randIntFromZero(responseDict["hunger"].food.length)];
            else responseDict["hunger"].other[MathUtils.randIntFromZero(responseDict["hunger"].other.length)];

            // Satiate the hunger.
            this.user.addToTomoHunger(CHARACTER._id as number, parseInt(gift?.values[0] || 0))
        };
        
        // Set the character to their mood.
        REACTION_NODE.ch = [
            {
                "id": CHARACTER.basic.pointers.original || CHARACTER._id as number,
                "mood": "normal", //responseMood, TESTING: CHANGE TO RESPONSE MOOD
                "useSkin": true
            }
        ];

        // Set the text to the response content.
        REACTION_NODE.txt = {
            "content": response.content,
            "speaker": 0
        };

        // Remove the item from the inventory.
        await this.user.setItemAsTomoGifted(this.chInUser[this.index]._id as number, gift._id as number, 1);
        this.user.updateTransferableInventory();
        this.user.updateTomo();

        // Insert the reaction node.
        await this.coreHandler.insertToMultiples([REACTION_NODE]);
        await this.coreHandler.cacheAssets(); // Recache.

        // Set the page to the reaction.
        await this.coreHandler.setPage(this.coreHandler.index + 1);

        // Return the response we collected.
        return response;
    }

    private async __gift_action(selection: number) {
        let value = this.invInGroups[this.currentInvIndex][selection].value;
        let parsedValue = parseInt(value);
        if (parsedValue == NaN) throw new EngineError("Tomo", "Error, parsed gift value is not a number (__gift_action)");
        const tandemValue = this.invInGroups[this.currentInvIndex][parsedValue]
        // Menu management
        switch (tandemValue.route) {
            case "backInventoryPage":
                if (this.currentInvIndex == 0) throw new EngineError("Tomo", "Error, trying to go back but no more selection columns.")
                this.currentInvIndex--;
                break;
            case "nextInventoryPage":
                if (this.currentInvIndex == this.invInGroups.length) throw new EngineError("Tomo", "Error, trying to move forward to next column but reached end.")
                this.currentInvIndex++;
                break;
            default: return;
        }
        // delete the selection in the core.
        this.coreHandler.selection = undefined;

        this.coreHandler.multiples[this.coreHandler.index].type.special.choices = this.invInGroups[this.currentInvIndex];
        await this.coreHandler.updateComponents();
        //await this.coreHandler.setPage(this.coreHandler.index)
    }

    private async __talk(CHARACTER: Character, index: number = this.index) {
        const SELECTED_STORY: Story = await CHARACTER.getStoryFromDB(CHARACTER._id as number, EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current), "interact")
        // Insert the story into the already init handler.
        await this.coreHandler.insertToMultiples(SELECTED_STORY.multiples);
        // Cache the newly added assets.
        await this.coreHandler.cacheAssets();
        // Set the page of the novel to the handler
        this.coreHandler.setPage(this.coreHandler.multiples[this.coreHandler.index + 1].i)
    }

    private async _interact(index: number = this.index) {
        // declare
        let BASIC = this.cachedCharacters.get(this.multiples[index].ch[0].id as number), CHARACTER: Character = BASIC;
        // if its not a normal mood.
        if (this.chInUser[index].stats.mood.current != 0) {
            const PAYLOAD = await Queries.characterBasicVariant(BASIC._id as number, EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current))
            // Get a new character variant based on the Variant basic.
            CHARACTER = new Character(PAYLOAD._id as number, PAYLOAD, BASIC.skins, await Queries.character(PAYLOAD.pointers.interaction, "interactions") as CharacterInteractions);
        };

        // Standard interaction
        const STANDARD: NovelSingle[] = [{
            "backable": false,
            "bg": this.chInUser[index].bgToUse || { "blurred": true, "id": 0},
            "ch": [{
                id: BASIC._id as number,
                mood: EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current),
                useSkin: true
            }],
            "txt": {
                "content": "$greetings",
                "speaker": 0
            },
            "type": {
                "display": "normal",
                "special": {
                    "type": "selection",
                    "default": "What\'s your move?",
                    "choices": [{
                        "label": "Gift",
                        "emoji": "🎁",
                        "value": "0",
                        "route": null,
                        "description": "Gift something."
                    }, {
                        "label": "Talk",
                        "emoji": "💬",
                        "value": "1",
                        "route": null,
                        "description": "Talk about something."
                    }]
                }
            }
        }]

        this.coreHandler = new NovelCore(this.interaction, STANDARD);

        this.coreHandler.once("ready", async () => {
            await this.coreHandler.start();
        })
        
        this.coreHandler.once("userSelectionConfirmed", async (i, selection) => {
            // edge cases.
            if (i != 0) throw new EngineError("Tomo", "Novel gave event \'userSelectionConfirmed\' at another index that is not \'0\'. ")
            
            switch (selection) {
                // gift
                case 0:
                    //SELECTED_STORY = await CHARACTER.getStoryFromDB(CHARACTER._id as number, EngineUtils.convertNumberToMoodStr(this.chInUser[index].stats.mood.current), "gift")
                    return this.__gift(CHARACTER)
                // talk
                case 1:
                    return this.__talk(CHARACTER, index)
            }
            
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
                    return this._info();
                case 1:
                // 1 is intearact.
                    return this._interact();
                case 2:
                // 2 is danger.
                    return this._danger();
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
        FOREGROUND.resize({width: 400, fit: sharp.fit.contain})

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
                //label: "Info",
                emoji: "🔎",
                style: MessageButtonStyles.SECONDARY
            }, {
                customId: "TOMO.button_" + "1" + "_user_" + this.interaction.user.id,
                label: "Interact",
                emoji: "💬",
                style: MessageButtonStyles.PRIMARY
            }, {
                customId: "TOMO.button_" + "2" + "_user_" + this.interaction.user.id,
                //label: "Danger",
                emoji: "🛑",
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

    /**
     * @name _endScreen
     * @description Temporary endscreen just used for testing and alpha (TODO)
     * @param tomoID the tomoID that 
     * @param LP 
     * @param XP 
     */
    private async _endScreen(LP: number, XP: number) {
        setTimeout( async () => {
            await this.interaction.editReply({
            components: [],
            content: "TEMPORARY END SCREEN\n 💖 LP GAINED: " + LP + "\n ✨ XP Gained (Tomo gets half): " + XP
        });}, 5000)

        await this.user.addToUserEXP(XP);
        await this.user.addToTomoEXP(this.chInUser[this.index]._id as number, XP / 2);
        await this.user.addToTomoLP(this.chInUser[this.index]._id as number, LP)

        await this.user.updateTomo();
        this.user.setUserInDB("universe");
    }

    /**
     * @name _rewardsCalculation
     * @description temporary rewards calculation module. (TODO: COMPLETE AFTER ALPHA)
     * @param {Reaction} reaction the mood needed to calculate the LP gain or loss.
     * @returns the LP gained or loss.
     */
    private async _rewardsCalculation(reaction: Reaction) {
        let LP = 0;
        switch (reaction.mood) {
            case "annoyed": 
                LP -= 5;
                break;
            case "flustered":
                LP += 15;
                break;
            case "happy":
                LP += 10;
                break;
            case "sad":
                LP -= 10;
                break;
        }
    return LP;
    }
}