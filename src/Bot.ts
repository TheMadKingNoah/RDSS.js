import { BaseGuildTextChannel, Client, ClientOptions, Collection, Message, MessageActionRow, MessageButton, TextChannel, User } from "discord.js";
const fs = require("fs");
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import Properties from "./utils/Properties";
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder } = require('@discordjs/builders');
require("dotenv").config();

console.log("Bot is starting...");

const client = new Client({
    intents: ["GUILDS", 'GUILD_MESSAGE_REACTIONS', "GUILD_MEMBERS"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const commandFiles = fs
    .readdirSync("./src/commands")
    .filter((file: string) => file.endsWith(".ts"));

const commands: string[] = [];

Properties.COMMANDS = new Collection();

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    Properties.COMMANDS.set(command.data.name, command)
}

client.once('ready', () => {
    console.log("Bot is now online!")

    const CLIENT_ID = client.user?.id;

    const rest = new REST({
        version: "9"
    }).setToken(process.env.BOT_TOKEN);

   async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commands
        })
    } catch(e){ 
            console.log(e)
    }
}
}
)

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