// imp

import { StatisticsUser, UniverseUser } from "../../types/models/users";
import Queries from "../../utilities/mongodb/queries";
import UniBase from "./base";
import ItemClass from "./items";

// author = shokkunn

export default class Users extends UniBase {
    // define
    universe: UniverseUser
    statistics: StatisticsUser
    constructor(
        _id: string,
        universe?: UniverseUser,
        statistics?: StatisticsUser
    ) {
        super(_id)
        // set
        this.universe = universe;
        this.statistics = statistics;
    }
    // getters

    public get skins() {
        return this.universe.inventory.intransferable.skins;
    }

    public get chs() {
        return this.universe.inventory.intransferable.chs;
    }

    public get bgs() {
        return this.universe.inventory.intransferable.bgs;
    }

    public get inventory() {
        return this.universe.inventory;
    }

    /**
     * @Name | pullUniverse
     * @Desc | pulls user universe like inventory, etc.
     */
    public async pullUniverse(): Promise<void> {
        this.universe = await Queries.user(this._id as string, "universe") as UniverseUser;
    }

    /**
     * @Name | pullStatistics
     * @Desc | pulls data of user stats.
     */
    public async pullStatistics(): Promise<void> {
        this.statistics = await Queries.user(this._id as string, "statistics") as StatisticsUser;
    }

    /** Inventory Management */

    /**
     * @name setUserInDB
     * @description calls query to update user.
     * @param {universe | statistics} type the db selection.
     */
    public setUserInDB(type: "universe" | "statistics") {
        Queries.updateUser(this._id as string, type, (type == "universe" ? this.universe : this.statistics))
    }

    /**
     * @name updateTransferableInventory
     * @description updates the database of the transferable inventory.
     */
    public async updateTransferableInventory() {
        await Queries.updateUserTransferableInventory(this._id as string, this.inventory.transferable)
    }

    /**
     * @name setItemAsTomoGifted
     * @description gives item to tomo. marks the gifted array with the item and stores it in tomo inventory.
     * @param tomoID number of the tomo you want to gift.
     * @param itemID the item id 
     * @param amount the item amount
     * @returns 
     */
    public async setItemAsTomoGifted(tomoID: number, itemID: number, amount: number = 1) {
        const payload = {
            "date": new Date(),
            "itemID": itemID
        }
        let tomo = this.findTomoIndexInInventory(tomoID);
        if (tomo < 0) return;
        await this.addToTransferableInventory(itemID, -Math.abs(amount));
        await this.addToTomoInventory(this.chs[tomo]._id as number, itemID, amount);
        this.inventory.intransferable.chs[tomo].stats.gift.recentReceived.sort((a, b) => b.date.getTime() - a.date.getTime());

        if (this.inventory.intransferable.chs[tomo].stats.gift.recentReceived.findIndex(i => i.itemID == itemID) >= 0) return;
        if (this.inventory.intransferable.chs[tomo].stats.gift.recentReceived.length == 3) {
            this.inventory.intransferable.chs[tomo].stats.gift.recentReceived[2] = payload;
        } else {
            this.inventory.intransferable.chs[tomo].stats.gift.recentReceived.unshift(payload);
        }
    }

    /**
     * @name addToUserEXP
     * @description This is a temporary command where you can add to a user exp.
     * If it reaches 100, we add one to the user's level and reset the exp.
     * @param {number} amount you want to add to the exp pool.
     */
    public async addToUserEXP(amount: number) {
        let FINAL = this.universe.exp + amount;
        if (FINAL >= 100) {
            this.universe.exp = 0;
            FINAL = 0;
            this.universe.level += 1;
        }
        this.universe.exp = FINAL;
        console.log(" Added " + FINAL + " to the user's EXP")
    }

    /**
     * @name addToTomoEXP
     * @param tomoID 
     * @param amount 
     */
    public async addToTomoEXP(tomoID: number, amount: number) {
        let tomo = this.findTomoIndexInInventory(tomoID);
        if (tomo < 0) return;
        
        let FINAL = this.chs[tomo].stats.xp + amount;
        if (FINAL >= 100) {
            FINAL = 0;
            this.chs[tomo].stats.xp = 0;
            this.chs[tomo].stats.level += 1;
        }
        this.chs[tomo].stats.xp = FINAL;
    }

    public async addToTomoLP(tomoID: number, amount: number) {
        let tomo = this.findTomoIndexInInventory(tomoID);
        if (tomo < 0) return;
        
        let FINAL = this.chs[tomo].stats.mood.meterxp + amount;
        if (FINAL >= 200) {
            FINAL = 0;
            this.chs[tomo].stats.mood.meterxp = 0;
            this.chs[tomo].stats.mood.meter += 1;
        }
        this.chs[tomo].stats.mood.meterxp = FINAL;
    }

    public async addToTomoHunger(tomoID: number, amount: number) {
        let tomo = this.findTomoIndexInInventory(tomoID);
        if (tomo < 0) return;
        
        let FINAL = this.chs[tomo].stats.hunger + amount;
        if (FINAL > 100) FINAL = 100;

        this.chs[tomo].stats.hunger = FINAL;
    }

    /**
     * @name updateTomo
     * @description Updates the tomo stats.
     */
    public async updateTomo() {
        await Queries.updateTomos(this._id as string, this.chs)
    }

    /**
     * @name hasItemInTransferableInv
     * @description checks if an item exists in a user TRANSFERABLE inventory.
     * @param id of the item you want to check
     * @returns -1 if it does not exist. any number if it does. number is index on inventory.
     */
    public hasItemInTransferableInv(id: number): number {
        return this.inventory.transferable.findIndex((items) => items._id == id);
    }

    /**
     * @name addToTransferableInventory
     * @description adds (or remove) item to the transferable 
     * @notice CALL SETUSERINDB WHEN YOU ARE DONE CHAINING!
     * @param id id of the item you want to add
     * @param amount amount of the item.
     */
    public async addToTransferableInventory(id: number, amount: number = 1) {
        const find: number = this.hasItemInTransferableInv(id)
        // if it does not exist, add it.
        if (find < 0) this.universe.inventory.transferable.push({_id: id, amount: amount});
        else {
            const result = this.universe.inventory.transferable[find].amount + amount;
            // add the amount to the inventory if it exists.
            if (result <= 0) this.universe.inventory.transferable.splice(find, 1); 
            // set the amount
            this.universe.inventory.transferable[find].amount = result;
        }
    }

    /**
     * @Name | populateBackground
     * @Desc | pulls background item from db.
     * @returns Populated db.
     */
    public async populateBackground() {
        return this.bgs.map(async (item) => await Queries.background(item))
    }

    /**
     * @name populateTransferableInventory
     * @description | populates User inentory
     * @returns mapped transferable array
     */
    public async populateTransferableInventory() {
        let ret: Array<ItemClass> = [], temp: ItemClass;
        for (const iterable of this.inventory.transferable) {
            try {
                temp = new ItemClass(await Queries.item(iterable._id), iterable.amount);
            } catch(e) {
                console.error(e);
                return ret;

            } finally {
                ret.push(temp);
            }
        }
        return ret;
    }

    /**
     * @name findTomoIndexInInventory
     * @description finds the index of the tomo
     * @param tomoID id of the tomo you want to find/
     * @returns index of tomo
     */
    public findTomoIndexInInventory(tomoID: number) {
        return this.chs.findIndex((tomo) => tomo._id == tomoID)
    }

    /**
     * @Name | getSkinOfTomo
     * @Desc | Gets the skin ID that the user wants to use for the requested tomo. NOT FULL SKIN
     * @param tomoID | ID of the tomodachi
     * @returns ID of the skin that the user has set for the tomo
     */
    public getSkinOfTomo(tomoID: number): number {
        let tomo = this.findTomoIndexInInventory(tomoID)
        if (tomo > 0) return this.chs[tomo].skinToUse;
        return -1;
    }

    public async addToTomoInventory(tomoID: number, itemID: number, amount: number) {
        let tomo = this.findTomoIndexInInventory(tomoID);
        if (tomo < 0) return;
        const FIND = this.chs[tomo].stats.inventory.findIndex(i => i._id == itemID);

        if (FIND < 0) {
            this.universe.inventory.intransferable.chs[tomo].stats.inventory.push({_id: itemID, amount: amount});
        }
        else {
            const result = this.universe.inventory.intransferable.chs[tomo].stats.inventory[FIND].amount + amount;
            console.log(result + " RESULT")
            // add the amount to the inventory if it exists.
            if (result <= 0) return this.universe.inventory.intransferable.chs[tomo].stats.inventory.slice(FIND); 
            // set the amount
            this.universe.inventory.intransferable.chs[tomo].stats.inventory[FIND].amount = result;
        }
        
    }
}