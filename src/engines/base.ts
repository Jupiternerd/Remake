//imports
import { Canvas, createCanvas, Image, loadImage } from "canvas";
import { CommandInteraction } from "discord.js";
import { EventEmitter } from "events";
import { CharacterBasic, CharacterInteractions, CharacterSkins, TemporaryMoodType } from "../types/models/characters";
import { BackgroundCapsule, BaseSingle, CharacterCapsule } from "../types/models/stories";
import { UniverseUser } from "../types/models/users";
import AssetManagement from "../utilities/assetManagement/assetUtililties";
import { EngineUtils } from "../utilities/engineUtilities/utils";
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
    public loadedImageCharacters: Map<string, Image>
    public loadedImageBackgrounds: Map<number, Image>
    public cachedBackgrounds: Map<number, Background>;
    public cachedCharacters: Map<number, Character>;

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

        // initialize caches.
        this.loadedImageBackgrounds = new Map();
        this.loadedImageCharacters = new Map();
        this.cachedBackgrounds = new Map();
        this.cachedCharacters = new Map();

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
            const KEY = `${capsule.id}_${capsule.mood}` // Key for Image loading map.
            // edge cases.
            if (capsule.useSkin == undefined) capsule.useSkin = false;
            // return if we already have the id.
            if (this.cachedCharacters.has(capsule.id) && this.loadedImageCharacters.has(KEY)) return;
            // query block.
            const BASIC: CharacterBasic = await Queries.character(capsule.id, "basic") as CharacterBasic; // Store basic data for use later.
            const SKINS: CharacterSkins = await Queries.character(capsule.useSkin ? this.user.getSkinOfTomo(capsule.id) : BASIC.pointers.skin, "skins") as CharacterSkins;
            // Interaction query is a bit tricky.         if the mood is normal (the current basic)                we just get it's interactions               :            we have to go through the character class where it 
            // fetches us the data from the Query.            
            const INTERACTION: CharacterInteractions = capsule.mood == "normal" ? await Queries.character(capsule.id, "interactions") as CharacterInteractions : await Character.getInteractionFromMood(capsule.id, capsule.mood);
            
            // Check if the basic we got is original.             If it is undefined, then we assume its the original.
            if (BASIC.pointers.original != BASIC._id && BASIC.pointers.original != undefined) throw new EngineError("Base", "Pointer for Character is not Original.")

            // set the cache.
            this.cachedCharacters.set(capsule.id, 
                new Character(capsule.id, BASIC, SKINS, INTERACTION)
            )
            // Image cache.
            this.loadedImageCharacters.set(KEY, await loadImage(AssetManagement.convertToPhysicalLink("characters", SKINS.moods[EngineUtils.convertStrToMoodNumber(capsule.mood)])))
            
        }
    }
    /**
     * Name | injectBackground
     * Desc | used in and outside the obj, this is to add bg caches.
     * @param {BackgroundCapsule} capsule that you want to inject into the engine.
     */
    public async injectBackground(capsule: BackgroundCapsule) {
        // if we already have it stored, return.
        if (this.cachedBackgrounds.has(capsule.id)) return;

        const BKG = await Queries.background(capsule.id) // Query the background from our Query handler.

        // set the cache.
        this.cachedBackgrounds.set(capsule.id, new Background(capsule.id, BKG));

        // set the image cache.
        this.loadedImageBackgrounds.set(capsule.id, await loadImage(AssetManagement.convertToPhysicalLink("backgrounds", BKG.link, capsule.blurred)))
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
            await this.injectBackground(singlet.bg)

            await this.injectCharacter(singlet.ch)

            i++;
        }
        // On next processor tick we declare everything as ready.
        process.nextTick(() => this.ready())
    }
    
}