// imports

import { CommandInteraction, Interaction } from "discord.js";
import client from "../../amadeus/client";
import Commands from "../../amadeus/commands";
import Listener from "../../amadeus/listeners";

// author = shokkunn

class InteractionCreate extends Listener {
    constructor() {
        super(
            "interactionCreate", {
                once: false
            }
        )
    }

    async execute(bot: client, interaction: CommandInteraction & Interaction): Promise<void> {
        // Check if the interaction is a command.
        if (!interaction.isCommand()) return; 

        // if there are no commands matching the interaction command name. 
        if (!bot.commands.has(interaction.commandName)) return;

        // Handling block.
        try {
            let cmd: Commands = bot.commands.get(interaction.commandName), sub: string; // get the stored command object of the interaction.

            // see if this passes checks.
            if ((await cmd.check(bot, interaction) && await cmd.defaultCheck(bot, interaction))) {
                // Trying out if the random discord api errors go away when I use deferReply.
                //await interaction.deferReply() 

                // If this is a sub command, we will look for the function with the same name to invoke it.
                if (interaction.options.data[0]?.type == "SUB_COMMAND") {
                    
                    console.log("➡️  " + interaction.user.username + " used sub command " + interaction.commandName + ".") //log

                    // get the sub command.
                    sub = interaction.options.getSubcommand(); 

                    if (typeof cmd[sub] === "function") return cmd[sub](bot, interaction); // risky, calling a function if only the name matches. could be exploited. Trusting discord.
                }

                console.log("➡️  " + interaction.user.username + " used main command " + interaction.commandName + ".") //log

                return cmd.execute(bot, interaction); // if there are no subcommands/methods, we call the normal entry. (execute)
            };
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: "Error executing this command!",
                ephemeral: true
            })
        };
    }
}

export = InteractionCreate;