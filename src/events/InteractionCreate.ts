import EventListener from "../modules/events/Event";
import Bot from "../Bot";

import { Interaction } from "discord.js";

module.exports = class InteractionCreateEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "interactionCreate",
            once: false
        });
    }
    
    async execute(interaction: Interaction) {
        if (interaction.isCommand()) this.client.commands.handle(interaction).catch(console.error);

        if (interaction.isSelectMenu()) this.client.select_menus.handle(interaction).catch(console.error);

        if (interaction.isContextMenuCommand()) this.client.contexts.handle(interaction).catch(console.error);

        if (interaction.isButton()) this.client.buttons.handle(interaction).catch(console.error);
    }
}