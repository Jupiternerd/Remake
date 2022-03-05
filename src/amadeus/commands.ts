// imports
import { SlashCommandBuilder } from "@discordjs/builders" ;
import { Interaction } from "discord.js";
import square from "../utilities/redis/square.js"
import Custom_Client from "./client";

// author = Shokkunn

/**
 * Class where all commands will inherit from.
 */
export default abstract class Commands {
    // Declare types.
    public name: string;
    private _data: SlashCommandBuilder = new SlashCommandBuilder()
    public desc: string;
    private _cooldown: number = 2000; // in ms.
    public disabled: boolean = false;
    constructor(
        name: string = null,
        desc: string = null,
        settings: {
            data: SlashCommandBuilder,
            limits?: {
                max?: number
                ownerOnly?: boolean
                mainOnly?: boolean
            },
            coolDown?: number // in ms.
        }

    ) {
        this.name = name.toLowerCase();
        this.desc = desc;
        this._data = settings.data;
        this._cooldown = settings.coolDown; // in ms.

        // Store this in the slash command builder.
        this._data.setName(this.name).setDescription(this.desc);
    }

    /** @Getters & @Setters */

    get cooldown() {
        return this._cooldown;
    }

    set cooldown(time: number) {
        this._cooldown = time;
    }

    /** @Overwritten functions */

    /**
     * @override
     * Name | execute
     * Desc | entry point of executing a function.
     * @param bot custom client of the bot.
     * @param interaction of the slash command.
     */
    async execute(bot: Custom_Client, interaction: Interaction): Promise<void> {
        throw new Error("Command not implemented.");
      }

    /**
     * @override
     * Name | check
     * Desc | function that checks if the command can be ran with the current interaction or bot config.
     * @param bot 
     * @param interaction 
     * @returns 
     */
    async check(bot: Custom_Client, interaction: Interaction) {
        return true;
    }

    /** @Helpful Functions */

    /**
     * Name | isUserInCoolDown
     * Desc | Check if the user is in cooldown.
     * @returns {boolean} true if they are in cd, false is not.
     * @param {Interaction} interaction of the command that got invoked.
     */
    static async isUserInCoolDown(interaction: Interaction, command: string): Promise<boolean> {
        // The .exists() spits out a number that matches the key so if there are 2 matches it will return 2. 0 if none.
        return (await square.memory().exists("cooldown", interaction.user.id, command) > 0 ? true : false ) // > 0 true. less than 0: false.

    }

    /**
     * Name | addUserToCoolDown
     * Desc | adds user to cooldown.
     * @param {Interaction} interaction of the command that got invoked
     * @param {string} command name of the command that you want to set as time outed.
     * @param {int} time in ms
     */
    static async addUserToCoolDown(interaction: Interaction, command: string, time: number): Promise<void> {
        await square.memory().hset("cooldown", interaction.user.id, command) // set the cooldown with the name of the command.
        square.memory().expire("cooldown", time);
    }


    /** Overloads */


    /**
     * Overload of isUserInCoolDown
     * @param interaction 
     * @param command 
     * @returns 
     */
     async isUserInCoolDown(interaction: Interaction, command: string = this.name): Promise<boolean> {
        return await Commands.isUserInCoolDown(interaction, command);
    }

    /**
     * overload of addUserToCoolDown
     * @param interaction 
     * @param command 
     * @param time 
     */
     async addUserToCoolDown(interaction: Interaction, command: string = this.name, time: number = this._cooldown) {
        Commands.addUserToCoolDown(interaction, command, time);
    }
}