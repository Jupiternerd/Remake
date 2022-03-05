// import classes from discord.js
import {Client, Collection, Intents} from 'discord.js';
import { payload } from '../types/local/commandPayload';

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
    
    /**
     * @param {object} entryOptions 
     */
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
     * @param {string} path | String that leads to the path.
     * @param {function} callback | Function that is called when a file is found.
     * @param {function} filter | Function that is ran before a callback is passed. Passes the file name. ie: "file.js"
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
    async verifyLocalAssets(): Promise<void> {
        // keep count of how many files are in the directories.
        let countOfCh: number, countOfBg: number;
        countOfCh = countOfBg = 0

        await this.driveThroughLocalFiles("./assets/backgrounds/", (file: string) => {
            // count the file.
            countOfBg++;
        });
        await this.driveThroughLocalFiles("./assets/characters/", (file: string) => {
            // count the file.
            countOfCh++;
        });

        console.info("Backgrounds: " + countOfBg + "\nCharacters: " + countOfCh + "\n") 
    }

    /**
     * @Name | loadCommands
     * Desc | Loads the command using the driveThroughLocalFiles function, if it is a js file we require it and init it.
     * @param {string} path
     */
    async loadModule(path: string = "./src/modules/") {
        this.driveThroughLocalFiles(path, (file: string) => {
            // gives us the full path of the file.
            const command = require(file);
            const cmd = new command();

            let payload: payload = cmd.data.toJSON();

        }, (onlyFile: string) => onlyFile.endsWith(".js"))
    }

    async loadEvents(path: string = "./src/modules/") {

    }

    /**
     * @Name | activate
     * Description | This function activates the bot.
     */
    async activate() {
        console.info("Activating " + this.name + "...\n")
        await this.verifyLocalAssets();
        
        //this.login(this._token); // login to the bot using the token.

    }

}