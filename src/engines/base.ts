//imports
import { Canvas, createCanvas, Image } from "canvas";
import { CommandInteraction } from "discord.js";
import { EventEmitter } from "events";
import { CharacterBasic, CharacterInteractions, CharacterSkins } from "../types/models/characters";
import { BaseSingle, CharacterCapsule } from "../types/models/stories";
import { UniverseUser } from "../types/models/users";
import { EngineError } from "../utilities/errors/errors";
import Queries from "../utilities/mongodb/queries";
import Background from "./classes/backgrounds";
import Character from "./classes/characters";
import Users from "./classes/users";

// author = shokkunn

/**
 * Name | EngineBase
 * Desc | Base of all game engine activity.
 */
export default class EngineBase extends EventEmitter {
    // define vars
    public interaction: CommandInteraction
    public requiredKeyPositions: Array<string>;

    // caches
    public loadedImageCharacters: Map<number, Image>
    public loadedImageBackgrounds: Map<number, Image>
    public cachedBackgrounds: Map<number | string, Background> = new Map();
    public cachedCharacters: Map<number | string, Character> = new Map();

    // settings
    public useSkins: boolean = false

    // iterables
    public multiples: Array<BaseSingle>

    // canvas
    public canvas: Canvas;

    // user
    public user: Users

    constructor(
        interaction: CommandInteraction,
        settings: {
            x: number,
            y: number,
        },
        multiples: Array<BaseSingle>,
        keys: Array<string> = ["bg", "ch"]
        ) {
        super();
        // set vars
        this.interaction = interaction;
        this.multiples = multiples;
        this.requiredKeyPositions = keys;

        // create canvas
        this.canvas = createCanvas(settings.x, settings.y)

        // prepare assets.
        this.cacheAssets()
    }

    /** Emitters */
    
    public ready() {
        this.emit("ready");
    }

    public pause() {
        this.emit("pause");
    }

    public end() {
        this.emit("end")
    }

    /**
     * Name | injectCharacter
     * Desc | used in and outside the obj, this is to add character caches.
     * @param {CharacterCapsule[]} ch | Array of character capsules you want to cache inside the engine.
     */
    public async injectCharacter(ch: Array<CharacterCapsule>) {
        // loop around the ch object to get individual capsules.
        for (const capsule of ch) {
            // edge cases.
            if (capsule.useSkin == undefined) capsule.useSkin = false;
            // return if we already have the id.
            if (this.cachedBackgrounds.has(capsule.id)) return;
            const BASIC = await Queries.character(capsule.id, "basic") as CharacterBasic // Store basic data for use later.

            // Check if the basic we got is original.
            if (BASIC.pointers.original != BASIC._id) throw new EngineError("Base", "Pointer for Character is not Original.")

            // set the cache.
            this.cachedCharacters.set(capsule.id, 
                new Character(capsule.id, BASIC,
                    await Queries.character(capsule.useSkin ? this.user.getSkinOfTomo(capsule.id) : BASIC.pointers.interaction, "skins") as CharacterSkins,
                    await Queries.character(BASIC.pointers.interaction, "interactions") as CharacterInteractions
                    )
                )
        }
    }
    /**
     * Name | injectBackground
     * Desc | used in and outside the obj, this is to add bg caches.
     * @param {number} id | id of the background you want to inject.
     */
    public async injectBackground(id: number) {
        // if we already have it stored, return.
        if (this.cachedBackgrounds.has(id)) return;

        // set the cache.
        this.cachedBackgrounds.set(id, new Background(id, await Queries.background(id)));
    }

    /**
     * Name | cacheAssets
     * Desc | prepare Assets.
     */
    public async cacheAssets() {
        // defining variables.
        let i: number = 0, singlet: BaseSingle;

        // grab user.
        this.user = new Users(this.interaction.user.id, await Queries.user(this.interaction.user.id, "universe") as UniverseUser);

        // loop
        for (singlet of this.multiples) {
            // loop variables.
            let indexSwap: number = (i > 0 ? i - 1 : 0), swappedMultiple: BaseSingle = this.multiples[indexSwap];

            // if there are any undefined variables, we replace them with the ones from before.
            for (const property of this.requiredKeyPositions) if (!singlet.hasOwnProperty(property)) singlet[property] = swappedMultiple[property];

            // index is optional but will be required later on so we substitute it with the internal iterator.
            if (singlet.i == undefined) singlet.i = i;

            // caching block.
            this.injectBackground(singlet.bg)

            this.injectCharacter(singlet.ch)

            i++;
        }
        console.log(this.cachedCharacters)


        
        // On next processor tick we declare everything as ready.
        process.nextTick(() => this.ready())
    }
    

    



}