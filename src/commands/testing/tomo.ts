// imports
import { CacheType, CommandInteraction, User } from "discord.js";
import client from "../../amadeus/client/client";
import Commands from "../../amadeus/abstracts/commands";
import NovelCore from "../../engines/novel/core";
import { BaseSingle, NovelSingle } from "../../types/models/stories";
import sharp from "sharp";
import Square from "../../utilities/redis/square";
import Mango from "../../utilities/mongodb/mango";
import Queries from "../../utilities/mongodb/queries";
import Users from "../../engines/classes/users";

import {UniverseUser} from "../../types/models/users"
import TomoCore from "../../engines/tomodachi/core";
import { EngineUtils } from "../../utilities/engineUtilities/utils";

class Tomo extends Commands {
    KEY: string;
    constructor() {
        super("tomo", // name 
        "runs tomo",
        {
            ownerOnly: false,
            coolDown: 2000
        }
        )
        this.KEY = "TOMO_CD_";
    }

    async check(bot: client, interaction: CommandInteraction<CacheType>): Promise<boolean> {
        if (await Square.memory().hget(this.KEY, interaction.user.id) != null) {
            interaction.reply("Finish your original tomo! Don't cheat >:(");
            return false;
        }

        await Square.memory().hset(this.KEY, interaction.user.id, Date.now());
        return true;
    }

    // Executes the command.
    public async execute(bot: client, interaction: CommandInteraction): Promise<void> {
        const data = await Queries.user(interaction.user.id, "universe") as UniverseUser;

        const USER = new Users(interaction.user.id, data)

        let arr: Array<BaseSingle> = [], i = 0;

        await USER.refreshAllMoods()


        for (const characters of USER.chs) {
            
            arr.push(
                {
                    "i": i,
                    "bg": {
                        "blurred": true,
                        "id": 0
                    },
                    "ch": [
                        {
                            "id": characters._id as number,
                            "mood": EngineUtils.convertNumberToMoodStr(characters.stats.mood.current),
                            "useSkin": true
                        }
                    ]
                }
            )
            i++;


        }
        //console.log("yikes")
        const tomo = new TomoCore(interaction, arr,USER.chs)
        tomo.once("ready", () => {
            tomo.start()
        })

        tomo.once("end", async () => {
            await Square.memory().hdel(this.KEY, interaction.user.id);
        })

        
    }
}

export = Tomo; // require doesn't seem to like 'export default class.'