// imports
import { SlashCommandBuilder } from "@discordjs/builders" ;
import { CommandInteraction, Interaction } from "discord.js";
import square from "../utilities/redis/square.js"
import Custom_Client from "./client";

// author = Shokkunn

/**
 * Class where all commands will inherit from.
 */
export default abstract class Commands {
    // Declare types.
    public name: string;
    private _data: SlashCommandBuilder;
    public desc: string;
    public limits: object;
    private _cooldown: number;
    public disabled: boolean = false;
    constructor(
        name: string = null,
        desc: string = null,
        data: SlashCommandBuilder = new SlashCommandBuilder(),
        settings?: {
            max?: number
            ownerOnly?: boolean
            mainOnly?: boolean
            coolDown?: number // in ms.
        }

    ) {
        // Set Values
        this.name = name.toLowerCase();
        this.desc = desc;
        this._data = data;
        this._cooldown = settings ? settings.coolDown : 2000; // in ms.

        // Store this in the slash command builder.
        this._data.setName(this.name).setDescription(this.desc);

        console.log(this._data.toJSON())
    }

    /** @Getters & @Setters */

    get cooldown() {
        return this._cooldown;
    }

    get data() {
        return this._data;
    }

    set cooldown(time: number) {
        this._cooldown = time;
    }

    set data(override: SlashCommandBuilder) {
        this._data = override;
    }


    /** @Overwritten functions */

    /**
     * @override
     * Name | execute
     * Desc | entry point of executing a function.
     * @param bot custom client of the bot.
     * @param interaction of the slash command.
     */
    async execute(bot: Custom_Client, interaction: CommandInteraction): Promise<void> {
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
    async check(bot: Custom_Client, interaction: CommandInteraction) {
        return true;
    }

    /** Checks */

    async defaultCheck(interaction: CommandInteraction): Promise<boolean | void> {
        // Disabled command check.
        if (this.disabled) return interaction.reply("This command has been disabled.");
        // Cool down check.
        if (this.cooldown > 0) if (await this.isUserInCoolDown(interaction)) return interaction.reply("Sorry you are on cooldown!")

        // All clear.
        return true;

    }

    /** @Helpful Functions */

    /**
     * Name | isUserInCoolDown
     * Desc | Check if the user is in cooldown.
     * @returns {boolean} true if they are in cd, false is not.
     * @param {Interaction} interaction of the command that got invoked.
     */
    static async isUserInCoolDown(interaction: CommandInteraction, command: string): Promise<boolean> {
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
    static async addUserToCoolDown(interaction: CommandInteraction, command: string, time: number): Promise<void> {
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
     async isUserInCoolDown(interaction: CommandInteraction, command: string = this.name): Promise<boolean> {
        return await Commands.isUserInCoolDown(interaction, command);
    }

    /**
     * overload of addUserToCoolDown
     * @param interaction 
     * @param command 
     * @param time 
     */
     async addUserToCoolDown(interaction: CommandInteraction, command: string = this.name, time: number = this._cooldown) {
        Commands.addUserToCoolDown(interaction, command, time);
    }
}