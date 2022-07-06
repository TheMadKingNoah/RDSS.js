import { Client, TextChannel } from "discord.js";
import path from "path";
const fs = require("fs");
require("dotenv").config();

console.log("Bot is starting...");

const client = new Client({
    intents: ["GUILDS", 'GUILD_MESSAGE_REACTIONS', "GUILD_MEMBERS", "GUILD_MESSAGES"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

let eventFiles;
if (process.env.BOT_TOKEN == "Production") {
    eventFiles = fs.readdirSync(path.join(__dirname, "./dist/events")).filter((file: string) => file.endsWith(".js"));
} else {
    eventFiles = fs.readdirSync(path.join(__dirname, "./events")).filter((file: string) => file.endsWith(".ts"));
}

console.log(eventFiles);

for (const file of eventFiles) {
    const event = require(path.join(__dirname, `./events/${file}`));

    if (event.once) {
        console.log("made it 1")
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        console.log("made it 1")
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.BOT_TOKEN);
