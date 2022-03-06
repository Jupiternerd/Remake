//imports
import { Canvas, createCanvas, Image } from "canvas";
import { CommandInteraction } from "discord.js";
import { EventEmitter } from "events";
import Background from "./classes/backgrounds";
import Character from "./classes/characters";

// author = shokkunn

/**
 * Name | EngineBase
 * Desc | Base of all game engine activity.
 */
export default class EngineBase extends EventEmitter {
    // define vars
    interaction: CommandInteraction

    // caches
    loadedCharacters: Map<number, Image>
    loadedBackgrounds: Map<number, Image>
    backgrounds: Map<number | string, Background> = new Map();
    characters: Map<number | string, Character> = new Map();

    // canvas
    canvas: Canvas;

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

    }

    /** Emitters */
    
    ready() {
        this.emit("ready");
    }

    pause() {
        this.emit("pause");
    }

    end() {
        this.emit("end")
    }
    

    



}