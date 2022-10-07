import { Client } from "discord.js";

import CommandHandler from "./modules/interactions/commands/Manager";
import ContextMenuHandler from "./modules/interactions/contexts/Manager";
import ButtonHandler from "./modules/interactions/buttons/Manager";
import EventHandler from "./modules/events/Manager";
import AlertMaintainer from "./utils/AlertMaintainer";

import "dotenv/config";

process.on("unhandledRejection", (error: Error) => {
    console.error(error.stack);
});

process.on("uncaughtException", (error: Error) => {
    console.error(error.stack);
});

console.log("Bot is starting...");

export default class Bot extends Client {
    commands!: CommandHandler;
    buttons!: ButtonHandler;
    alertMaintainer!: AlertMaintainer;
    contexts!: ContextMenuHandler;

    constructor() {
        super({
            intents: [
                "GUILDS",
                'GUILD_MESSAGE_REACTIONS',
                "GUILD_MEMBERS",
                "GUILD_VOICE_STATES",
                "GUILD_MESSAGES"
            ],
            partials: [
                "MESSAGE",
                "CHANNEL",
                "REACTION"
            ],
        });

        (async () => {
            this.commands = new CommandHandler(this);
            this.buttons = new ButtonHandler(this);
            this.alertMaintainer = new AlertMaintainer(this);
            this.contexts = new ContextMenuHandler(this);

            const events = new EventHandler(this);
            events.load().catch(console.error);

            await this.login(process.env.BOT_TOKEN);
        })();
    }
}

new Bot();
