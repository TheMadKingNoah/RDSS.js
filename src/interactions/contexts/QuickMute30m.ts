
import Bot from "../../Bot";

import { GuildMember, Message, MessageContextMenuInteraction, TextChannel, User } from "discord.js";
import ContextMenu from "../../modules/interactions/contexts/ContextMenu";
import QuickMute from "../../utils/QuickMute";
import Properties from "../../utils/Properties";
import RoleUtils from "../..//utils/RoleUtils";

export default class QuickMute30mCommand extends ContextMenu {
    constructor(client: Bot) {
        super(client, {
            name: "Quickmute 30m",
            type: "MESSAGE",
        });
    }

    async execute(interaction: MessageContextMenuInteraction) {
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

        QuickMute.quickMuteUser(
            interaction.user, 
            interaction.targetMessage.author.id, 
            "30m", interaction.targetMessage.content, 
            commandsChannel,
            interaction.targetMessage as Message
        )

        await QuickMute.purgeMessagesFromUserInChannel(
            interaction.channel as TextChannel, 
            interaction.targetMessage.member as GuildMember, 
            interaction.targetMessage.author as User
        );

        interaction.reply({ 
            content: `${interaction.targetMessage.member} has been muted for 30 minutes!`, 
            ephemeral: true 
        }).catch(console.error);
    }
}