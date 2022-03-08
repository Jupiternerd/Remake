//imports
import { Canvas, createCanvas, Image } from "canvas";
import { CommandInteraction } from "discord.js";
import { EventEmitter } from "events";
import { BaseSingle } from "../types/models/stories";
import Background from "./classes/backgrounds";
import Character from "./classes/characters";

// author = shokkunn

/**
 * Name | EngineBase
 * Desc | Base of all game engine activity.
 */
export default class EngineBase extends EventEmitter {
    // define vars
    public interaction: CommandInteraction

    // caches
    public loadedCharacters: Map<number, Image>
    public loadedBackgrounds: Map<number, Image>
    public backgrounds: Map<number | string, Background> = new Map();
    public characters: Map<number | string, Character> = new Map();

    // iterables
    public multiples: Array<BaseSingle>

    // canvas
    public canvas: Canvas;

    constructor(
        interaction: CommandInteraction,
        size: {
            x: number,
            y: number
        }
        ) {
        super();
        // set vars
        this.interaction = interaction;

        // create canvas
        this.canvas = createCanvas(size.x, size.y)

        // prepare assets.
        this.prepareAssets()
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
     * Name | prepareAssets
     * Desc | prepare Assets.
     */
    public async prepareAssets() {
        // defining variables.
        
        
        // On next processor tick we declare everything as ready.
        process.nextTick(() => this.ready())
    }
    

    



}