import Button from "../../modules/interactions/buttons/Button";
import ModAlert from "../../utils/ModAlert";
import Bot from "../../Bot";

import { ButtonInteraction, GuildMember, Message, ThreadChannel } from "discord.js";
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

      
       //trial phase
       if(!interaction.member) return;
       if (RoleUtils.hasAnyRole(interaction.member as GuildMember, [RoleUtils.roles.trialModerator])) {
        interaction.client.channels.fetch(Properties.channels.trialLogs).then(channel => {
            (channel as ThreadChannel).send(`${interaction.member} approved a mod-alert: \n\n \`\`\`${modAlertMessage.content}\`\`\``)
        })
    }
    }
}