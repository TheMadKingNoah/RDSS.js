import { Interaction } from "discord.js";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";

module.exports = class InteractionCreateEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "interactionCreate",
            once: false
        });
    }
    
    async execute(interaction: Interaction) {
        if (interaction.isCommand()) {
                  this.client.commands.handle(interaction);
        }

        if (interaction.isButton()) {
                  this.client.buttons.handle(interaction);
        }
    }
}
