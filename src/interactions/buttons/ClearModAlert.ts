import Button from "../../modules/interactions/buttons/Button";
import ModAlert from "../../utils/ModAlert";
import Bot from "../../Bot";

import { ButtonInteraction, GuildMember, Message, TextChannel, ThreadChannel } from "discord.js";
import RoleUtils from "../../utils/RoleUtils";
import Properties from "../../utils/Properties";

export default class ClearModAlertButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "ClearModAlert"
        });
    }

    async execute(interaction: ButtonInteraction) {
      const modAlertMessage = interaction.message as Message;
      
      const messageId = modAlertMessage.content
            .split("/")[6]
            .replace(/\D/g, '');

      ModAlert.deleteModAlert(messageId, modAlertMessage, null);

       if(!interaction.member) return;
        interaction.client.channels.fetch(Properties.channels.commandLogs).then(channel => {
            (channel as TextChannel).send(`${interaction.member} approved a mod-alert: \n\n \`\`\`${modAlertMessage.content}\`\`\``)
        })
    }
}