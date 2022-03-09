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
                type: {
                    display: "normal"
                },
                backable: false,
                bg: {
                    id: 0,
                    blurred: true
                },
                ch: [{
                    id: 0,
                    useSkin: false,
                    mood: "happy"
                }, {
                    id: 0,
                    useSkin: false,
                    mood: "happy"
                }],
                txt: {
                    speaker: 1,
                    content: "Hi!"
                }
            },
            {
                type: {
                    display: "duet"
                },
                backable: false,
                ch: [{
                    id: 0,
                    useSkin: false,
                    mood: "happy"
                }, {
                    id: 0,
                    useSkin: false,
                    mood: "normal"
                }],
                txt: {
                    speaker: 1,
                    content: "Hi!"
                }
            }
            
        ]
        const novel = new NovelCore(interaction, multiples)
        novel.once("ready", async () => {
            await novel.stageTwo()
        })
        interaction.reply("Logged");
    }
}

export = Novel; // require doesn't seem to like 'export default class.'