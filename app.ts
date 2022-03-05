// import the custom client from src/amadeus/client.ts
import Custom_Client from "./src/amadeus/client";

// init the dot env.
require("dotenv").config();
// Author = Shokkunn

// Initiazlie the client
new Custom_Client(
    {
        // Data that is needed to initialize the bot.
        name: "Ophelia",
        bot_token: process.env.TOKEN,
        owner_id: process.env.OWNER_ID,
        main_server_id: process.env.GUILD_ID,
        client_id: process.env.CLIENT_ID
}
).activate();