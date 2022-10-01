import Button from "../../modules/interactions/buttons/Button";
import Properties from "../../utils/Properties";
import Bot from "../../Bot";

import { ButtonInteraction, TextChannel } from "discord.js";

export default class InfractionsButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "Infractions"
        });
    }

    async execute(interaction: ButtonInteraction) {
        const authorId = interaction.message.content.split("`")[3];
        const commandsChannel = await this.client.channels.fetch(Properties.channels.commands) as TextChannel;

        if (!commandsChannel) {
            await interaction.reply({
                content: "Unable to fetch the commands channel.",
                ephemeral: true
            });
            return;
        }

        commandsChannel.send(`;inf search ${authorId}`).then(message => {
            interaction.reply({
                content: `view infractions here ${message.url}`,
                ephemeral: true
            }).catch(console.error);
        }).catch(console.error);
    }
}