import Button from "../../modules/interactions/buttons/Button";
import Bot from "../../Bot";

import {ButtonInteraction, Message} from "discord.js";

export default class MessageDeleteButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "deleteMessage"
        });
    }

    async execute(interaction: ButtonInteraction) {
        (interaction.message as Message).delete().catch(console.error);
    }
}