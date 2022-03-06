//imp

import { CharacterInteractions, CharacterSkins } from "../../types/models/characters";
import Queries from "../../utilities/mongodb/queries";
import UniBase from "./base";

// author = shokkunn

export default class Character extends UniBase{
    skins: CharacterSkins
    interactions: CharacterInteractions
    /**
     * Name | Character
     * Desc | encapsulates character data in a class.
     * @param skins 
     * @param interactions 
     */
    constructor(skins?: CharacterSkins, interactions?: CharacterInteractions) {
        super()
        this.skins = skins ? skins : null;
        this.interactions = interactions ? interactions : null;
    }

    /**
     * Name | GetSkinFromDB
     * Desc | gets skin from db 
     * @returns characterSkins
     */
    async setSkinFromDB() {
        this.skins = await Queries.character(this._id as number, "skins") as CharacterSkins;
    }

    /**
     * Name | SetInteractionFromDB
     * Desc | gets interaction from db
     */
    async setInteractionFromDB() {
        this.interactions= await Queries.character(this._id as number, "interactions") as CharacterInteractions;
    }

    /** Overloads */

    /**
     * Name | SetInteractionFromDB
     * Desc | gets interaction from db
     */
    static async getSkinFromDB(id: number): Promise<CharacterSkins> {
        return await Queries.character(id, "skins") as CharacterSkins;
    }

    /**
     * Name | SetInteractionFromDB
     * Desc | gets interaction from db
     */
    static async getInteractionFromDB(id: number): Promise<CharacterInteractions> {
        return await Queries.character(id, "interactions") as CharacterInteractions;
    }
}