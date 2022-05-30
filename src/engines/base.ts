//imports
import { ButtonInteraction, CollectorFilter, CommandInteraction, InteractionCollector, Message, MessageComponentInteraction, MessageComponentType, SelectMenuInteraction } from "discord.js";
import { EventEmitter } from "events";
import { CharacterBasic, CharacterInteractions, CharacterSkins } from "../types/models/characters";
import { BackgroundCapsule, BaseSingle, CharacterCapsule, NovelSingle } from "../types/models/stories";
import { UniverseUser } from "../types/models/users";
import AssetManagement from "../utilities/assetManagement/assetUtililties";
import { EngineUtils } from "../utilities/engineUtilities/utils";
import { EngineError } from "../utilities/errors/errors";
import Queries from "../utilities/mongodb/queries";
import Background from "./classes/backgrounds";
import Character from "./classes/characters";
import Users from "./classes/users";
import sharp, { Sharp } from "sharp";

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
    public loadedImageCharacters: Map<string, Sharp>
    public loadedImageBackgrounds: Map<string, Sharp>
    public cachedBackgrounds: Map<number, Background>;
    public cachedCharacters: Map<number, Character>;

    // settings
    public useSkins: boolean = false;
    public timeout: number;
    public X: number;
    public Y: number;

    // user Interaction objects
    public buttonCollector: InteractionCollector<ButtonInteraction>;
    public selectCollector: InteractionCollector<SelectMenuInteraction>
    public message: Message<boolean>

    // function to filter interaction
    protected _filter: CollectorFilter<[unknown]> = async (buttonInteraction: MessageComponentInteraction) => {
        // defer update.
        buttonInteraction.deferred ? null : await buttonInteraction.deferUpdate()
        // we only want to know if the interactor is the same as the user.
        return buttonInteraction.user.id === this.interaction.user.id;
    }
    // iterables
    public multiples: Array<BaseSingle>

    // user
    public user: Users

    constructor(
        interaction: CommandInteraction,
        settings: {
            x: number,
            y: number,
            timeout: number;
        },
        multiples: Array<BaseSingle & NovelSingle>,
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

        // settings
        this.timeout = settings.timeout;

        // background Image size
        this.X = settings.x,
        this.Y = settings.y,

        this.cacheAssets()
    }

    /** Emitters */
    
    protected ready() {
        this.emit("ready");
    }

    protected timedOut() {
        this.emit("timedOut");
    }

    protected pageChange(...args: any) {
        this.emit("pageChange", ...args)
    }
    protected loaded() {
        this.emit("loaded");
    }

    protected pause() {
        this.emit("pause");
    }

    protected end() {
        this.emit("end")
    }
    /**
     * @Name | refreshCoolDown
     * @Desc | refreshes cool down on the interaction collectors. 
     * Everytime the user clicks the button so that they don't get timed out.
     */
    public refreshCoolDown(): void {
        // Call the resetTimer function on the collectors.
        this.buttonCollector ? this.buttonCollector.resetTimer() : null;
        this.selectCollector ? this.selectCollector.resetTimer() : null;
    }
    
    /**
     * @Name | createCollector
     * @Desc | creates a collector from desired specs.
     * @param {MessageComponentType} type the component you want to create.
     * @param {CollectorFilter} filter function that filters what you want to create.
     * @returns {InteractionCollector<MessageComponentInteraction | ButtonInteraction | SelectMenuInteraction>} your desired collector.
     */
     protected _createCollector(type: MessageComponentType, limit: number = null, filter: CollectorFilter<[unknown]> = this._filter): InteractionCollector<MessageComponentInteraction | ButtonInteraction | SelectMenuInteraction> {
        const COLLECTOR = this.message.createMessageComponentCollector({
            filter,
            componentType: type,
            max: limit,
            time: this.timeout // variable set in constructor.
        })

        return COLLECTOR;
    } 
    /**
     * @Name | injectCharacter
     * @Desc | used in and outside the obj, this is to add character caches.
     * @param {CharacterCapsule[]} capsule | Array of character capsules you want to cache inside the engine.
     */
    public async injectCharacter(capsule: CharacterCapsule) {
        // get the key.
        let KEY = EngineUtils.getCharacterCacheKey(capsule.id, capsule.mood), skinBuffer: number;
        // edge cases.
        if (capsule.useSkin == undefined) capsule.useSkin = false;
        // return if we already have the id.
        if (this.cachedCharacters.has(capsule.id) && this.loadedImageCharacters.has(KEY)) return;
        // query block.
        const BASIC: CharacterBasic = await Queries.character(capsule.id, "basic") as CharacterBasic; // Store basic data for use later.
        // If we have to use the skin that the user has set.
        if (capsule.useSkin) {
            skinBuffer = this.user.getSkinOfTomo(capsule.id);
            // If the user has no skin set we use the default. If they do we use their id.
            skinBuffer = (skinBuffer >= 0 ? skinBuffer : skinBuffer = BASIC.pointers.skin);
        } else skinBuffer = BASIC.pointers.skin;
        // Get the skins frmo the db.
        const SKINS: CharacterSkins = await Queries.character(skinBuffer, "skins") as CharacterSkins;
        // Interaction query is a bit tricky.         if the mood is normal (the current basic)                we just get it's interactions               :            we have to go through the character class where it 
        // fetches us the data from the Query.            
        const INTERACTION: CharacterInteractions = capsule.mood == "normal" ? await Queries.character(capsule.id, "interactions") as CharacterInteractions : await Character.getInteractionFromMood(capsule.id, capsule.mood);
        
        // Check if the basic we got is original.             If it is undefined, then we assume its the original.
        if (BASIC.pointers.original != BASIC._id && BASIC.pointers.original != undefined) throw new EngineError("Base", "Pointer for Character is not Original. (injectCharacter)")
        // set the cache.
        this.cachedCharacters.set(capsule.id, 
            new Character(capsule.id, BASIC, SKINS, INTERACTION)
        )
        // Image cache.
        this.loadedImageCharacters.set(KEY, sharp(AssetManagement.convertToPhysicalLink("characters", SKINS.moods[EngineUtils.convertStrToMoodNumber(capsule.mood)])))
    }
    /**
     * @Name | injectBackground
     * @Desc | used in and outside the obj, this is to add bg caches.
     * @param {BackgroundCapsule} capsule that you want to inject into the engine.
     */
    public async injectBackground(capsule: BackgroundCapsule) {
        // variables.
        let BGSHARP: Sharp;
        // if we already have it stored, return.
        if (this.cachedBackgrounds.has(capsule.id) && this.loadedImageBackgrounds.has(EngineUtils.getBackgroundCacheKey(capsule.id, capsule.blurred))) return;

        const BKG = await Queries.background(capsule.id) // Query the background from our Query handler.
        BGSHARP = sharp(AssetManagement.convertToPhysicalLink("backgrounds", BKG.link)) // Turn the background into image.
        // set the cache.
        this.cachedBackgrounds.set(capsule.id, new Background(capsule.id, BKG));
        // if the setting is to be blurred.
        if (capsule.blurred) BGSHARP.blur(6);
        // load the image into the cache.
        this.loadedImageBackgrounds.set(EngineUtils.getBackgroundCacheKey(capsule.id, capsule.blurred), BGSHARP)
    }
    /**
     * @Name | cacheAssets
     * @Desc | prepare Assets.
     */
    public async cacheAssets() {
        // defining variables.
        var i: number = 0, singlet: BaseSingle
        try {
            // grab user.
            this.user = new Users(this.interaction.user.id, await Queries.user(this.interaction.user.id, "universe") as UniverseUser);
        } catch(e) {
            // throw err.
            throw new EngineError("Base", "User not found in DB. Are they initialized? (cacheAssets)");
        }
        // loop
        for (singlet of this.multiples) {
            // index is optional but will be required later on so we substitute it with the internal iterator.
            if (singlet.i == undefined) singlet.i = i;

            // loop variables.
            let indexSwap: number = (i > 0 ? i - 1 : 0), swappedMultiple: BaseSingle = this.multiples[indexSwap];

            // if there are any undefined variables, we replace them with the ones from before.
            for (const PROPERTY of this.requiredKeyPositions) if (!singlet.hasOwnProperty(PROPERTY)) singlet[PROPERTY] = swappedMultiple[PROPERTY];

            // since there is only one bg we can just give the handler just that.
            await this.injectBackground(singlet.bg)

            // however since the chs are in an array, we have to give it one by one using the loop.
            for (const ch of singlet.ch) await this.injectCharacter(ch)
            
            // iterator to store index.
            i++;
        }
        // On next processor tick we declare everything as ready.
        process.nextTick(() => this.loaded());
    }
}