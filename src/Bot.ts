import { Client } from "discord.js";

import CommandHandler from "./modules/interactions/commands/Manager";
import ButtonHandler from "./modules/interactions/buttons/Manager";
import EventHandler from "./modules/events/Manager";

import "dotenv/config";

console.log("Bot is starting...");

export default class Bot extends Client {
    commands!: CommandHandler;
    buttons!: ButtonHandler;

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
            this.commands = new CommandHandler(this);
            this.buttons = new ButtonHandler(this);

            const events = new EventHandler(this);
            events.load();

            this.login(process.env.BOT_TOKEN);
        })();
    }
}

new Bot();
