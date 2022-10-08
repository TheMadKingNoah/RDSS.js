import {Client} from "discord.js";

import CommandHandler from "./modules/interactions/commands/Manager";
import ButtonHandler from "./modules/interactions/buttons/Manager";
import SelectMenuHandler from "./modules/interactions/select_menus/Manager";
import EventHandler from "./modules/events/Manager";

import "dotenv/config";
import EventWinners from "./utils/EventWinners";

process.on("unhandledRejection", (error: Error) => {
    console.error(error.stack);
});

process.on("uncaughtException", (error: Error) => {
    console.error(error.stack);
});

console.log("Bot is starting...");

export default class Bot extends Client {
    winners!: EventWinners;
    commands!: CommandHandler;
    buttons!: ButtonHandler;
    select_menus!: SelectMenuHandler;

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
            this.winners = new EventWinners(this);
            this.commands = new CommandHandler(this);
            this.buttons = new ButtonHandler(this);
            this.select_menus = new SelectMenuHandler(this);

            const events = new EventHandler(this);
            events.load().catch(console.error);

            await this.login(process.env.BOT_TOKEN);
        })();
    }
}

new Bot();
