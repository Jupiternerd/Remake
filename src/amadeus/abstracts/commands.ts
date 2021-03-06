// imports
const { SlashCommandBuilder } = require("@discordjs/builders");
import { CommandInteraction } from "discord.js";
import Queries from "../../utilities/mongodb/queries.js";
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
    public mainOnly: boolean;
    public cooldown: number;
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
        if (this.ownerOnly) this.data.set
        this.cooldown = settings ? settings.coolDown / 1000 : 2; // in s.
        this.mainOnly = settings ? settings.mainOnly : false;

        // Store this in the slash command builder.
        this.data.setName(this.name).setDescription(this.desc);
    }


    /** @Overwritten functions */

    /**
     * @override
     * @Name | execute
     * @Desc | entry point of executing a function.
     * @param bot custom client of the bot.
     * @param interaction of the slash command.
     */
    abstract execute(bot: Custom_Client, interaction: CommandInteraction): Promise<void>;

    /**
     * @override
     * @Name | check
     * @Desc | function that checks if the command can be ran with the current interaction or bot config.
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

        // Main server check.
        if (this.mainOnly) {
            interaction.reply("This command does not work here.")
            return false;
        }

        // Owner check.
        if (this.ownerOnly) if (interaction.user.id !== bot.owner_id) {
            return false;
        }

        // Cool down check.
        if (this.cooldown > 0) {
            const COMMAND = (await square.memory().get('cd_' + interaction.user.id));

            if (COMMAND?.toLowerCase() == interaction.commandName.toLowerCase()) {
                
                const CD = await this.getUserInCoolDown(interaction.user.id);
                const TIMESTAMP = `<t:${CD + Math.floor(Date.now() / 1000)}:R>`;
                interaction.reply({content: `???? \`\`${interaction.commandName}\`\` is on cooldown! Retry ${TIMESTAMP}.`, ephemeral: true})
                return false;
                
            } else {
                this.addUserToCoolDown(interaction);
            }
        }

        // Finally, Check user is in Db.
        if (!(await Queries.user(interaction.user.id, "universe"))) {
            // Add in user Database.
            return false;
        }

        return true;
    }

    /** @Helpful Functions */

    /**
     * @Name | isUserInCoolDown
     * @Desc | Check if the user is in cooldown.
     * @returns {boolean} true if they are in cd, false is not.
     * @param {Interaction} interaction of the command that got invoked.
     */
    static async isUserInCoolDown(interaction: CommandInteraction, command: string): Promise<boolean> {
        // The .exists() spits out a number that matches the key so if there are 2 matches it will return 2. 0 if none.
        return (await square.memory().exists(`cd_${interaction.user.id}`) > 0 ? true : false ) // > 0 true. less than 0: false.
    }

    /**
     * @name getUserInCoolDown
     * @description gets the user in cd's information about the cd.
     * @param userID  
     * @returns the type of user in cd.
     */
    static async getUserInCoolDown(userID: string): Promise<number> {
        return (await square.memory().ttl(`cd_${userID}`));
    }

    /**
     * @Name | addUserToCoolDown
     * @Desc | adds user to cooldown.
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
     * overload of getUserInCoolDown
     * @param userID 
     * @param command 
     * @returns 
     */
    async getUserInCoolDown(userID: string): Promise<number> {
        return await Commands.getUserInCoolDown(userID)
    }

    /**
     * overload of addUserToCoolDown
     * @param interaction 
     * @param command 
     * @param time 
     */
     async addUserToCoolDown(interaction: CommandInteraction, command: string = this.name, time: number = this.cooldown) {
        Commands.addUserToCoolDown(interaction, command, time);
    }
}