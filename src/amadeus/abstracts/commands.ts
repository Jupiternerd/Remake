// imports
const { SlashCommandBuilder } = require("@discordjs/builders");
import { CommandInteraction } from "discord.js";
import square from "../../utilities/redis/square.js"
import Custom_Client from "../client/client";

// author = Shokkunn

/**
 * Class where all commands will inherit from.
 */
export default abstract class Commands {
    // Declare types.
    public name: string;
    public data: typeof SlashCommandBuilder;
    public desc: string;
    public limits: object;
    private _cooldown: number;
    public disabled: boolean = false;
    public ownerOnly: boolean;
    constructor(
        name: string = null,
        desc: string = null,
        settings: {
            max?: number
            ownerOnly?: boolean
            mainOnly?: boolean
            coolDown?: number // in ms.
        },
        data?: typeof SlashCommandBuilder

    ) {
        // Set Values
        this.name = name.toLowerCase();
        this.desc = desc;
        this.data = data || new SlashCommandBuilder();
        this.ownerOnly = settings ? settings.ownerOnly : false;
        this._cooldown = settings ? settings.coolDown / 1000 : 2; // in s.

        // Store this in the slash command builder.
        this.data.setName(this.name).setDescription(this.desc);
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

    async defaultCheck(bot: Custom_Client, interaction: CommandInteraction): Promise<boolean | void> {

        // Disabled command check.
        if (this.disabled) {
            interaction.reply("This command has been disabled.")
            return false;
        };

        // Owner check.
        if (this.ownerOnly) if (interaction.user.id !== bot.owner_id) {
            return false;
        }

        // Cool down check.
        if (this.cooldown > 0) {
            if (await this.isUserInCoolDown(interaction)) {
                interaction.reply("Sorry you are on cooldown!")
                return false;
            } else {
                this.addUserToCoolDown(interaction);
            }
        }

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
        return (await square.memory().exists(`cd_${interaction.user.id}`, command) > 0 ? true : false ) // > 0 true. less than 0: false.

    }

    /**
     * Name | addUserToCoolDown
     * Desc | adds user to cooldown.
     * @param {Interaction} interaction of the command that got invoked
     * @param {string} command name of the command that you want to set as time outed.
     * @param {int} time in ms
     */
    static async addUserToCoolDown(interaction: CommandInteraction, command: string, time: number): Promise<void> {
        const key = `cd_${interaction.user.id}`
        await square.memory().set(key, command) // set the cooldown with the name of the command.
        square.memory().expire(key, time);
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