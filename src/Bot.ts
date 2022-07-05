import { Client }  from "discord.js";
const fs = require("fs");
require("dotenv").config();

console.log("Bot is starting...");

const client = new Client({
    intents: ["GUILDS", 'GUILD_MESSAGE_REACTIONS', "GUILD_MEMBERS", "GUILD_MESSAGES"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const eventFiles = fs
    .readdirSync("./src/events")
    .filter((file: string) => file.endsWith(".ts"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.BOT_TOKEN);