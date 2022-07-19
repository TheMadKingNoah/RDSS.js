import { Client } from "discord.js";
import path from "path";
import fs from "fs";

import "dotenv/config";

console.log("Bot is starting...");

export default class Bot extends Client {
    // commands!: CommandHandler;

    constructor() {
        super({
            intents: [
                "GUILDS",
                'GUILD_MESSAGE_REACTIONS',
                "GUILD_MEMBERS",
                "GUILD_VOICE_STATES",
                "GUILD_MESSAGES"],
            partials: [
                "MESSAGE",
                "CHANNEL",
                "REACTION"
            ],
        });

        (async () => {
            // Event Handler
            let eventFiles;

            if (process.env.BOT_TOKEN == "Production") {
                eventFiles = fs.readdirSync(path.join(__dirname, "./dist/events")).filter((file: string) => file.endsWith(".js"));
            } else {
                eventFiles = fs.readdirSync(path.join(__dirname, "./events")).filter((file: string) => file.endsWith(".ts"));
            }

            for (const file of eventFiles) {
                const event = require(path.join(__dirname, `./events/${file}`));

                if (event.once) {
                    this.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.on(event.name, (...args) => event.execute(...args));
                }
            }

            // this.commands = new CommandHandler(this);

            this.login(process.env.BOT_TOKEN);
        })();
    }
}

new Bot();
