import Button from "../../modules/interactions/buttons/Button";
import ModAlert from "../../utils/ModAlert";
import Bot from "../../Bot";

import {ButtonInteraction, GuildMember, Message, TextChannel, ThreadChannel} from "discord.js";
import Properties from "../../utils/Properties";
import RoleUtils from "../../utils/RoleUtils";

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

        if (!interaction.member) return;

        const logContent = `<:checkmark:${Properties.emojis.checkmark}> **${interaction.user.tag}** (\`${interaction.user.id}\`) has resolved a mod-alert:\n\`\`\`${modAlertMessage.content}\`\`\``;

        if (RoleUtils.hasRole(interaction.member as GuildMember, RoleUtils.roles.trialModerator)) {
            const parentLogChannel = await interaction.guild?.channels.fetch(Properties.channels.moderators) as TextChannel;
            const logChannel = await parentLogChannel.threads.fetch(Properties.threads.trialLogs) as ThreadChannel;
            await logChannel.send(logContent);
        }

        const commandLogs = await interaction.client.channels.fetch(Properties.channels.commandLogs) as TextChannel;
        await commandLogs.send(logContent);
    }
}