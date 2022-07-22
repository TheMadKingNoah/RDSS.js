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

        try {
            this.client.channels.fetch(Properties.COMMANDS_CHANNEL_ID).then(commandChannel => {
                (commandChannel as TextChannel).send(`;inf search ${authorId}`).then(message => {
                    interaction.reply({ 
                        content: `view infractions here ${message.url}`, 
                        ephemeral: true, 
                        fetchReply: true 
                    });
                });
            });
        } catch (err) {
            console.error(err);
        }
    }
}