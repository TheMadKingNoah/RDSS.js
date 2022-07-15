import { REST } from "@discordjs/rest";
import { Client, Options, TextChannel } from "discord.js";
const { Routes } = require('discord-api-types/v9');
import path from "path";
const fs = require("fs");
require("dotenv").config();

console.log("Bot is starting...");

const client = new Client({
    makeCache: Options.cacheWithLimits({
        MessageManager: 10000,
        GuildMemberManager: 10000
    }),

    intents: ["GUILDS", 'GUILD_MESSAGE_REACTIONS', "GUILD_MEMBERS", "GUILD_VOICE_STATES", "GUILD_MESSAGES"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

let eventFiles;
if (process.env.BOT_TOKEN == "Production") {
    eventFiles = fs.readdirSync(path.join(__dirname, "./dist/events")).filter((file: string) => file.endsWith(".js"));
} else {
    eventFiles = fs.readdirSync(path.join(__dirname, "./events")).filter((file: string) => file.endsWith(".ts"));
}

for (const file of eventFiles) {
    const event = require(path.join(__dirname, `./events/${file}`));

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.BOT_TOKEN);
