// import classes from discord.js
import {Client, Collection, Intents} from 'discord.js';

// define intents.
const default_intents: number[] = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_MEMBERS,
]

const fs = require("fs");
// Author = Shokkunn

export default class Custom_Client extends Client {
    // declare variables.
    private _token: string;
    private _owner_id: string;
    private _guild_id: string;
    public name: string;
    
    constructor(entryOptions: {
        // Data that is needed to initialize the bot. 
        name: string, // Name of the bot.
        bot_token: string, // Bot token.
        owner_id: string, // Bypass slow mode,etc.
        main_server_id: string, // We need this to get the slash commands to the server.

    }) {
        super({
            intents: default_intents
        }); // get the default intents from the global variable default_intents.

        // set the variables.
        this.name = entryOptions.name;
        this._token = entryOptions.bot_token;
        this._owner_id = entryOptions.owner_id;
        this._guild_id = entryOptions.main_server_id;

    }

    /**
     * @Name | driveThroughLocalFiles
     * Description | This function recursively loops through the files in the directory, ignoring folders and spitting back file paths.
     * @param path | String that leads to the path.
     * @param filter | Function that is ran before a callback is passed. Passes the file name. ie: "file.js"
     * @param callback | Function that is called when a file is found.
     */
    async driveThroughLocalFiles(path: string, callback: Function, filter: Function = () => {return true}): Promise<void> {
        // drive through the files in the directory.
        try {
            for (const file of fs.readdirSync(path)) {
                // if the file is a directory.
                if (fs.statSync(path + file).isDirectory()) {
                    // see this function again.
                    await this.driveThroughLocalFiles(path + file + "/", callback);
                } else {
                    // if the file matches the filter, we return the callback.
                    if (filter(file)) callback(path + file);          
                }
            }
        } catch (error) {
            console.error(error);
        }
        
    }
    
    /**
     * @Name | verifyLocalAssets
     * Description | This function checks if ./assets exists and has files.
     */
    async verifyLocalAssets(path: string): Promise<number> {
        // keep count of how many files are in the directories.
        let count: number = 0;
        await this.driveThroughLocalFiles(path, (file: string) => {
            // count the file.
            count++;
        });
        return count; // return the count.   
    }

    /**
     * @Name | activate
     * Description | This function activates the bot.
     */
    async activate() {
        console.info("Activating " + this.name + "...\n")

        const bgs = await this.verifyLocalAssets("./assets/backgrounds/")
        const chs = await this.verifyLocalAssets("./assets/characters/")

        console.info("Backgrounds: " + bgs + "\nCharacters: " + chs + "\n")
        
        //this.login(this._token); // login to the bot using the token.

    }

}