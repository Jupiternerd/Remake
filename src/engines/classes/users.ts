// imp

import { Item } from "../../types/models/items";
import { StatisticsUser, UniverseUser } from "../../types/models/users";
import Queries from "../../utilities/mongodb/queries";
import UniBase from "./base";

// author = shokkunn

export default class Users extends UniBase {
    // define
    universe: UniverseUser
    statistics: StatisticsUser
    constructor(
        id: string,
        universe?: UniverseUser,
        statistics?: StatisticsUser
    ) {
        super(id)
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

    /**
     * Name | pullUniverse
     * Desc | pulls user universe like inventory, etc.
     * @param universe 
     */
    public async pullUniverse(universe?: UniverseUser): Promise<void> {
        if (universe) this.universe = universe;
        this.universe = await Queries.user(this.id as string, "universe") as UniverseUser;
    }

    /**
     * Name | pullStatistics
     * Desc | pulls data of user stats.
     */
    public async pullStatistics(): Promise<void> {
        this.statistics = await Queries.user(this.id as string, "statistics") as StatisticsUser;
    }
    /** Inventory Management */

    /**
     * Name | populateSkins
     * Desc | populates the skins with 
     * @returns Populated db.
     */
    

    /**
     * Name | populateBackground
     * Desc | pulls background item from db.
     * @returns Populated db.
     */
    public async populateBackground() {
        return this.bgs.map(async (item) => await Queries.background(item))
    }

    public findTomoIndexInInventory(tomoID: number) {
        return this.chs.findIndex((tomo) => tomo._id = tomoID)
    }

    /**
     * Name | getSkinOfTomo
     * Desc | Gets the skin ID that the user wants to use for the requested tomo. NOT FULL SKIN
     * @param tomoID | ID of the tomodachi
     * @returns ID of the skin that the user has set for the tomo
     */
    public getSkinOfTomo(tomoID: number): number {
        if (this.findTomoIndexInInventory(tomoID) > 0) return this.chs[tomoID].skinToUse;
        return -1;
    }
}