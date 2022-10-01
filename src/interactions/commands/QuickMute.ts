import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import { CommandInteraction } from "discord.js";

export default class QuickMuteCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "quickmute",
            description: "Quick mute a user."
        });
    }

    async execute(interaction: CommandInteraction) {
        interaction.reply({ 
            content: "This command is not yet implemented.", 
            ephemeral: true 
        }).catch(console.error);
    }
}