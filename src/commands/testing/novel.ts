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
            ownerOnly: false
        }
        )
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        const multiples: Array<NovelSingle> = [ {
            "backable": true,
            "bg": {
                "blurred": true,
                "id": 0
            },
            "ch": [
                {
                    "id": 0,
                    "mood": "normal"
                }
            ],
            "txt": {
                "content": "First Node. Testing blurred background and User talking mode. (character should be gray)",
                "speaker": "user"
            },
            "type": {
                "display": "normal",
                "special": {
                    "type": "normal"
                }
            }
        },
        {
            "bg": {
                "blurred": false,
                "id": 0
            },
            "txt": {
                "content": "Second Node. Testing unblur and Monologue talking mode. (character should be gray)",
                "speaker": "monologue"
            }
        },
        {
            "backable": false,
            "txt": {
                "content": "Third Node. Testing Character talking mode and backable set to false. (color)",
                "speaker": 0
            }
        },
        {
            "backable": true,
            "txt": {
                "content": "Fourth Node. Testing special type: Selection. Speaker should be user. Default Placeholder should be 'Select A Choice From The Menu.' (char should be gray)",
                "speaker": "user"
            },
            "type": {
                "display": "normal",
                "special": {
                    "type": "selection",
                    "choices": [{
                        "label": "Choice Number one (1) BLUE SQUARE.",
                        "emoji": "🟦",
                        "description": "Description One. to: next Node.",
                        "route": "next",
                        "value": "0"
                    },
                    {
                        "label": "Choice Number one (2) RED CIRCLE.",
                        "emoji": "🔴",
                        "description": "Description Two. to: FIRST NODE.",
                        "route": 0,
                        "value": "1"
                    }],
                    "default": "Select A Choice From The Menu."
                }
            }
        },
        {
            "backable": false,
            "ch": [
                {
                    "id":0,
                    "mood": "normal",
                    "useSkin": false
                },
                {
                    "id":0,
                    "mood": "normal",
                    "useSkin": false
                }
            ],
            "txt": {
                "content": "Fifth Node. Duet testing. Left character should be the one speaking and right should be grayscaled.",
                "speaker": 0
            },
            "type": {
                "display": "duet",
                "special": {
                    "type": "normal"
                }
            }
        },
        {
            "txt": {
                "content": "Sixth Node. Duet testing. Right should now be normal. Left should be grayscaled.",
                "speaker": 1
            }
        },
        {
            "txt": {
                "content": "Seventh Node. Testing monologue talking with duet characters. Everyone should be grayscaled.",
                "speaker": "monologue"
            }
        },
        {
            "txt": {
                "content": "Eighth Node. Testing user talking with duet characters. Should still be grayscaled.",
                "speaker": "user"
            }
        },
        {
            "txt": {
                "content": "Ninth Node. Testing Switch back to normal display mode. Character should be talking.",
                "speaker": 0
            },
            "ch": [
                {
                    "id": 0,
                    "mood": "normal"
                }
            ],
            "type": {
                "display": "normal",
                "special": {
                    "type": "normal"
                }
            }
        },
        {
            "txt": {
                "content": "Tenth Node. Rest of the remaining nodes will be to test the speed of loading the nodes. Duet dispaly mode will only be used with Monologue speaker option.",
                "speaker": "monologue"
            },
            "ch": [
                {
                    "id":0,
                    "mood": "normal",
                    "useSkin": false
                },
                {
                    "id":0,
                    "mood": "normal",
                    "useSkin": false
                }
            ],
            "type": {
                "display": "duet",
                "special": {
                    "type": "normal"
                }
            }
        },
        {
            "txt": {
                "content": "11th Node. Rest of the remaining nodes will be to test the speed of loading the nodes. Duet dispaly mode will only be used with Monologue speaker option.",
                "speaker": "monologue"
            },
            "ch": [
                {
                    "id":0,
                    "mood": "normal",
                    "useSkin": false
                },
                {
                    "id":0,
                    "mood": "normal",
                    "useSkin": false
                }
            ],
            "type": {
                "display": "duet",
                "special": {
                    "type": "normal"
                }
            }
        },
        {
            "txt": {
                "content": "12th Node. Rest of the remaining nodes will be to test the speed of loading the nodes. Duet dispaly mode will only be used with Monologue speaker option.",
                "speaker": "monologue"
            },
        },
        {
            "txt": {
                "content": "13th Node. Rest of the remaining nodes will be to test the speed of loading the nodes. Duet dispaly mode will only be used with Monologue speaker option.",
                "speaker": "monologue"
            },
        },
        {
            "txt": {
                "content": "14th Node. Rest of the remaining nodes will be to test the speed of loading the nodes. Duet dispaly mode will only be used with Monologue speaker option.",
                "speaker": "monologue"
            },
        },
        {
            "txt": {
                "content": "15th Node. Rest of the remaining nodes will be to test the speed of loading the nodes. Duet dispaly mode will only be used with Monologue speaker option.",
                "speaker": "monologue"
            },
        },
        {
            "txt": {
                "content": "END Node. END",
                "speaker": "monologue"
            },
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