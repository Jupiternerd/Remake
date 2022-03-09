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
                bg: {
                    id: 0,
                    blurred: true
                },
                type: {
                    display: "normal"
                },
                ch: [{
                    id: 0,
                    useSkin: false,
                    mood: "normal"
                }],
                txt: {
                    speaker: "character",
                    who: 0
                }
            },
            {
                backable: false,
            },
        ]
        const novel = new NovelCore(interaction, multiples)
        novel.on("ready", () => {
            console.log(novel.cachedCharacters.get(0).interactions.base.greetings[0])
        })
        interaction.reply("Logged");
    }
}

export = Novel; // require doesn't seem to like export default class.