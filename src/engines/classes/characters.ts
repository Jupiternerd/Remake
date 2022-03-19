//imp

import { CharacterBasic, CharacterInteractions, CharacterSkins, TemporaryMoodTypeStrings } from "../../types/models/characters";
import { Story } from "../../types/models/stories";
import { MathUtils } from "../../utilities/engineUtilities/utils";
import Queries from "../../utilities/mongodb/queries";
import UniBase from "./base";

// author = shokkunn

export default class Character extends UniBase {
    // define
    basic: CharacterBasic
    skins: CharacterSkins
    interactions: CharacterInteractions
    /**
     * @Name | Character
     * @Desc | encapsulates character data in a class.
     * @param skins 
     * @param interactions 
     */
    constructor(id: number, basic?: CharacterBasic, skins?: CharacterSkins, interactions?: CharacterInteractions) {
        super(id)
        this.basic = basic ? basic : null;
        this.skins = skins ? skins : null;
        this.interactions = interactions ? interactions : null;
    }

    /** Getters */

    get giftReactions() {
        return this.interactions ? this.interactions.gifts : null;
    }

    get hungerReactions() {
        return this.interactions?.gifts?.hunger ? this.interactions.gifts.hunger : null;
    }

    get baseReactions() {
        return this.interactions?.base ? this.interactions.base : null;
    }

    /**
     * Name | GetSkinFromDB
     * Desc | gets skin from db 
     * @returns characterSkins
     */
    public async getSkinFromDB(id: number = this._id as number) {
        await Character.getSkinFromDB(id);
    }
    /**
     * @Name | SetInteractionFromDB
     * @Desc | gets interaction from db
     */
    public async setInteractionFromDB(id: number = this._id as number) {
        await Character.getInteractionFromDB(id);
    }
    /**
     * @Name | getInteractionFromMood
     * @Desc | gets the interaction variant from mood.
     * @param id | original id of the tomo.
     * @param {TemporaryMoodTypeStrings} mood | string mood.
     * @returns {CharacterInteractions} Interaction
     */
    public async getInteractionFromMood(id: number = this._id as number, mood: TemporaryMoodTypeStrings): Promise<CharacterInteractions> {
         return await Character.getInteractionFromMood(id, mood);
    }

    /**
     * 
     * @param id of the character
     * @param mood mood you want to get
     * @param type 
     * @returns 
     */
    public async getStoryFromDB(id: number = this._id as number, mood: TemporaryMoodTypeStrings, type: "base" | "interact" | "gift"): Promise<Story> {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAA")
        // edge case.
        if (mood == "current") return;
        
        
        if (mood != "normal" && this.basic.pointers.original == this._id) {
            const VARIANT = await Queries.characterBasicVariant(id, mood);
            return Queries.story(VARIANT.stories[type][MathUtils.randIntFromZero(VARIANT.stories[type].length)])
        }
        return await Queries.story(this.basic.stories[type][MathUtils.randIntFromZero(this.basic.stories[type].length)])
    }

    /** Overloads */

    /**
     * @Name | SetInteractionFromDB
     * @Desc | gets interaction from db
     */
    public static async getSkinFromDB(id: number): Promise<CharacterSkins> {
        return await Queries.character(id, "skins") as CharacterSkins;
    }

    /**
     * @Name | SetInteractionFromDB
     * @Desc | gets interaction from db
     */
    public static async getInteractionFromDB(id: number): Promise<CharacterInteractions> {
        return await Queries.character(id, "interactions") as CharacterInteractions;
    }

    /**
     * @Name | getInteractionFromMood
     * @Desc | gets the interaction variant from mood.
     * @param id | original id of the tomo.
     * @param {TemporaryMoodTypeStrings} mood | string mood.
     * @returns {CharacterInteractions} Interaction
     */
    public static async getInteractionFromMood(id: number, mood: TemporaryMoodTypeStrings): Promise<CharacterInteractions> {
        const VARIANT = await Queries.characterBasicVariant(id, mood) 
        return await Queries.character(VARIANT.pointers.interaction, "interactions") as CharacterInteractions;
    }


    /** Novel */
}