
import Bot from "../../Bot";

import {
    ApplicationCommandType,
    GuildMember,
    Message,
    MessageContextMenuCommandInteraction,
    TextChannel,
    User
} from "discord.js";
import ContextMenu from "../../modules/interactions/contexts/ContextMenu";
import QuickMute from "../../utils/QuickMute";
import Properties from "../../utils/Properties";
import RoleUtils from "../..//utils/RoleUtils";
import ModAlert from "../../utils/ModAlert";

export default class QuickMute30mCommand extends ContextMenu {
    constructor(client: Bot) {
        super(client, {
            name: "Quickmute 60m",
            type: ApplicationCommandType.Message,
        });
    }

    async execute(interaction: MessageContextMenuCommandInteraction) {
        const commandsChannel = await interaction.guild?.channels.fetch(Properties.channels.commands) as TextChannel;

        if (!RoleUtils.hasAnyRole(interaction.member as GuildMember, [
            RoleUtils.roles.moderator,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager
        ])) {
            interaction.reply({ 
                content: `Invalid Permissions!`, 
                ephemeral: true 
            }).catch(console.error);
            return;
        }

        if (!commandsChannel) return;

        await QuickMute.quickMuteUser(
            interaction.user, 
            interaction.targetMessage.author.id, 
            "60m", interaction.targetMessage.content, 
            commandsChannel,
            interaction.targetMessage as Message
        )

        await QuickMute.purgeMessagesFromUserInChannel(
            interaction.channel as TextChannel, 
            interaction.targetMessage.member as GuildMember, 
            interaction.member as GuildMember
        );

        const modAlertChannel = await interaction.guild?.channels.fetch(Properties.channels.alerts) as TextChannel;
        if (!modAlertChannel) return;

        ModAlert.deleteModAlert(interaction.targetMessage.id, null, modAlertChannel);

        interaction.reply({ 
            content: `${interaction.targetMessage.author} has been muted for 60 minutes!`, 
            ephemeral: true 
        }).catch(console.error);
    }
}