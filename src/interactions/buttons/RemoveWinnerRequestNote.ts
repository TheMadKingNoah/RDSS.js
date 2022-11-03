import Button from "../../modules/interactions/buttons/Button";
import Bot from "../../Bot";

import { ButtonInteraction } from "discord.js";

export default class RemoveWinnerRequestNoteButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "removeWinnerRequestNote"
        });
    }

    async execute(interaction: ButtonInteraction) {
        interaction.message.embeds[0].fields?.pop();

        if (interaction.message.components?.length === 2)
            interaction.message.components.pop();
        else
            interaction.message.components?.[0].components.pop();

        await interaction.update({
            embeds: interaction.message.embeds,
            // @ts-ignore
            components: interaction.message.components
        })
            .catch(async (err) => {
               await interaction.reply({
                   content: "Unable to remove note",
                   ephemeral: true
               }).catch(console.error);
               console.error(err);
            });
    }
}