"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const path_1 = tslib_1.__importDefault(require("path"));
const fs = require("fs");
require("dotenv").config();
console.log("Bot is starting...");
const client = new discord_js_1.Client({
    intents: ["GUILDS", 'GUILD_MESSAGE_REACTIONS', "GUILD_MEMBERS", "GUILD_MESSAGES"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
const eventFiles = fs.readdirSync(path_1.default.join(__dirname, "./events"))
    .filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        console.log("made it 1");
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        console.log("made it 1");
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.login(process.env.BOT_TOKEN);
