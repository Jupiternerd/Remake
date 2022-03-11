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
        super("novella", // name 
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
                    display: "duet",
                    special: {
                        type: "normal"
                    }
                },
                backable: true,
                bg: {
                    id: 0,
                    blurred: true
                },
                ch: [{
                    id: 0,
                    mood: "normal"
                }, {
                    id: 0,
                    mood: "happy"
                }],
                txt: {
                    speaker: 0,
                    content: "Oh my god William is SO HOT!!!!!!!!!!!"
                }
            },
            {
                type: {
                    display: "duet"
                },
                txt: {
                    speaker: 1,
                    content: "OMG IKRR!"
                }
            }
            
        ]
        const novel = new NovelCore(interaction, multiples)
        novel.once("ready", () => {
            //console.log(novel.multiples[1].ch)
            novel.start()
        })
    }
}

export = Novel; // require doesn't seem to like 'export default class.'