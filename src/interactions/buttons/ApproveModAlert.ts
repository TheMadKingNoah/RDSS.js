import Button from "../../modules/interactions/buttons/Button";
import ModAlert from "../../utils/ModAlert";
import Bot from "../../Bot";

import { ButtonInteraction, Message } from "discord.js";

export default class ApproveModAlertButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "ApproveModAlert"
        });
    }

    async execute(interaction: ButtonInteraction) {
      const modAlertMessage = interaction.message as Message;
      
      const messageId = modAlertMessage.content
            .split("/")[6]
            .replace(/\D/g, '');

      ModAlert.deleteModAlert(messageId, modAlertMessage, null);
    }
}