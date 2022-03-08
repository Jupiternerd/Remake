// imports
import { CommandInteraction } from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import NovelCore from "../../engines/novel/core";
import { NovelSingle } from "../../types/models/stories";


// author = Shokkunn

/**
 * Name | Ping command
 */
class Novel extends Commands {
    constructor() {
        super("novel", // name 
        "runs novel",
        {
            ownerOnly: true
        }
        )
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        const multiples: Array<NovelSingle> = [ 
            {
                backable: false,
                bg: 0,
                ch: [{
                    id: 0,
                    useSkin: false,
                    mood: "normal"
                }],
                txt: "wassup"
                
            },
            {
                backable: false,
            },
        ]
        const novel = new NovelCore(interaction, multiples)
        novel.on("ready", () => {
            console.log("ready!")
        })
        interaction.reply("Logged");
    }
}

export = Novel; // require doesn't seem to like export default class.