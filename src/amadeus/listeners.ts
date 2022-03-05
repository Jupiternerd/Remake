// author = shokkunn

import Custom_Client from "./client";

// Listner class.
export default abstract class Listener {
    public name: string = null;
    public once: boolean; // if this should be ran once.

    constructor(name: string, settings: {
        once: boolean
    }) {
        // set values.
        this.name = name;
        this.once = settings.once;
    }

    /**
     * @override
     * @param bot | custom client of the bot.
     * @param args ...any
     */
    async execute(bot: Custom_Client, ...args) {
        throw new Error("Listener not implemented.");
    }


}