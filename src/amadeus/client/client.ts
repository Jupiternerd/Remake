// import classes from discord.js
import {ApplicationCommandPermissionData, Client, Collection, Guild, GuildApplicationCommandPermissionData, Intents} from 'discord.js';
import { statSync, readdirSync } from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9'
import Commands from '../abstracts/commands';
import Listener from '../abstracts/listeners';
import Square from '../../utilities/redis/square';
import Mango from '../../utilities/mongodb/mango';
import { AssetType } from '../../types/local/static';

// define intents.
const default_intents: number[] = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_MEMBERS,
]

// author = shokkunn

export default class Custom_Client extends Client {
    // declare variables.
    private _token: string;
    private _guild_id: string;
    private _client_id: string;
    public name: string;
    public owner_id: string;
    public slashCommands: any[] = [];
    public commands: Collection<string, Commands> = new Collection()
    
    /**
     * @param {object} entryOptions 
     */
    constructor(entryOptions: {
        // Data that is needed to initialize the bot. 
        name: string, // Name of the bot.
        bot_token: string, // Bot token.
        owner_id: string, // Bypass slow mode,etc.
        main_server_id: string, // We need this to get the slash commands to the server.
        client_id: string, // bot client ID.

    }) {
        super({
            intents: default_intents,
            shards: "auto"
        }); // get the default intents from the global variable default_intents.

        // set the variables.
        this.name = entryOptions.name;
        this._token = entryOptions.bot_token;
        this.owner_id = entryOptions.owner_id;
        this._guild_id = entryOptions.main_server_id;
        this._client_id = entryOptions.client_id;
    }

    /**
     * @Name | driveThroughLocalFiles
     * @Description | This function recursively loops through the files in the directory, ignoring folders and spitting back file paths.
     * @param {string} path | String that leads to the path.
     * @param {function} callback | Function that is called when a file is found.
     * @param {function} filter | Function that is ran before a callback is passed. Passes the file name. ie: "file.js"
     */
    async driveThroughLocalFiles(path: string, callback: Function, filter: Function = () => {return true}): Promise<void> {
        // drive through the files in the directory.
        try {
            for (const file of readdirSync(path)) {
                // if the file is a directory.
                if (statSync(path + file).isDirectory()) {
                    // see this function again.
                    await this.driveThroughLocalFiles(path + file + "/", callback, filter);
                } else {
                    // if the file matches the filter, we return the callback.
                    if (filter(file)) callback(path + file);          
                }
            }
        } catch (error) {
            // incase the path is not available.
            console.error(error);
        }
        
    }
    
    /**
     * @Name | verifyLocalAssets
     * @Description | This function checks if ./assets exists and has files.
     */
    async verifyLocalAssets(): Promise<void> {
        // keep count of how many files are in the directories.
        let countArr: number[] = [0, 0], folder: string, dirs: string[] = Object.keys(AssetType).filter((val) => isNaN(Number(val)) === false).map(key => AssetType[key]), i: number = 0;

        // loop block
        for (folder of dirs) {
            // loop through the dirs
            await this.driveThroughLocalFiles(`./assets/${folder}/`, (file: string) => { // essentially look through ./assets/{backgrounds} then ./assets/{characters}.
                // count the files in those folders.
                countArr[i]++;
            });
            // add one so that it goes from "backgrounds"o -> "characters";
            i++;
        }
        console.info("Backgrounds: " + countArr[0] + "\nCharacters: " + countArr[1] + "\n") // log the output.
    }

    /**
     * @Name | loadModules
     * @Desc | Loads the command using the driveThroughLocalFiles function, if it is a js file we require it and init it.
     * @param {string} path
     */
    async loadModules(path: string = "./src/commands/") {
        await this.driveThroughLocalFiles(path, (file: string) => {
            // gives us the full path of the file.
            const command = require(`../../.${file}`);
            const cmd: Commands = new command();

            // Command storing.
            const payload = cmd.data.toJSON(); // prepare to JSON to PUT.

            this.slashCommands.push(payload); // push into slashCommands to send.

            this.commands.set(payload.name, cmd); // Set the name of the command to the class for command handling later.

            console.log("🟢 Loaded CMD > " + cmd.data.name);

        }, (onlyFile: string) => onlyFile.endsWith(".js"))

        console.log(this.slashCommands);

        this.pushSlashesToDiscord() // finally send the slash commands to discord.

    }

    /**
     * @Name | loadEvents
     * @Desc | loads listeners in a specific path.
     * @param {string} path of the events. default.
     */
    async loadEvents(path: string = "./src/events/") {
        await this.driveThroughLocalFiles(path, (file: string) => {
            const event = require(`../../.${file}`);
            const ev: Listener = new event(); // init new event listener

            if (ev.once) { // if it is once
                super.once(ev.name, (...args) => ev.execute(this, ...args))
            } else { // if it is continuous
                super.on(ev.name, (...args) => ev.execute(this, ...args))
            }

            console.log("🟩 Loaded EVT > " + ev.name)

        }, (onlyFile: string) => onlyFile.endsWith(".js"))
    }
    
    /**
     * Name | pushSlashesToDiscord
     * Desc | Pushes the slash commands to discord.
     */
    async pushSlashesToDiscord() {
        const rest = new REST({ version: "9"}).setToken(this._token); // init new Rest client.
        
        try {
            await rest.put(
                Routes.applicationGuildCommands(
                    this._client_id, 
                    this._guild_id
                ),
            {
                body: this.slashCommands // json of our slash commands.
            });

        } catch(error) {
            console.error(error);
        }
    }

    /**
     * @Name | activate
     * Description | This function activates the bot.
     */
    async activate() {

        // warn.
        console.info("\n🌼 Activating " + this.name + "...\n")

        // verify local files.
        await this.verifyLocalAssets();

        // connect redis.
        await Square.con()

        // connect mongo.
        await Mango.con();

        // load local files.
        this.loadModules()
        await this.loadEvents();
        
        this.login(this._token); // login to the bot using the token.

    }

}