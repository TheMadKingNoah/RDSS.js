import { Client, IntentsBitField, Options, Partials } from "discord.js";

import "dotenv/config";
import EventHandler from "./modules/events/Manager";
import ButtonHandler from "./modules/interactions/buttons/Manager";

import CommandHandler from "./modules/interactions/commands/Manager";
import ContextMenuHandler from "./modules/interactions/contexts/Manager";
import SelectMenuHandler from "./modules/interactions/select_menus/Manager";
import AlertMaintainer from "./utils/AlertMaintainer";
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
    alertMaintainer!: AlertMaintainer;
    contexts!: ContextMenuHandler;
    
    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.GuildMessages,
            ],
            partials: [
                Partials.Message,
                Partials.Reaction,
                Partials.Channel,
            ],
            makeCache: Options.cacheWithLimits({
                ...Options.DefaultMakeCacheSettings,
                // ReactionManager: 0,
                // GuildMemberManager: 0,
            })
        });

        (async () => {
            this.winners = new EventWinners(this);
            this.commands = new CommandHandler(this);
            this.buttons = new ButtonHandler(this);
            this.select_menus = new SelectMenuHandler(this);
            this.alertMaintainer = new AlertMaintainer(this);
            this.contexts = new ContextMenuHandler(this);

            const events = new EventHandler(this);
            events.load().catch(console.error);

            await this.login(process.env.BOT_TOKEN);
        })();
    }
}

new Bot();
