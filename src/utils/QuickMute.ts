import RoleUtils from "../utils/RoleUtils";
import ModAlert from "./ModAlert";
import Properties from "./Properties";

import {
    ButtonInteraction,
    MessageAttachment,
    GuildMember,
    TextChannel,
    Message,
    User
} from "discord.js";

export default class QuickMute {
    public static async quickMuteUser(moderator: User, authorId: string, duration: string, messageEvidence: string, commandsChannel: TextChannel, message: Message | null) {
        const member = await commandsChannel.guild.members.fetch(authorId);

        if (!member) {
            if (message) message.delete().catch(console.error);
            await commandsChannel.send(`<@${moderator.id}> user <@${authorId}> (${authorId}) has left the server!`)
            return;
        }

        if (RoleUtils.hasAnyRole(member, [
            RoleUtils.roles.trialModerator,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager,
            RoleUtils.roles.bot
        ])) {
            await commandsChannel.send(`${moderator} Oops! You can't Quick Mute another moderator. (Nice try though)`)
            return;
        }

        if (message) message.delete().catch(console.error);
        const evidence = messageEvidence.replace(/\r?\n|\r/g, " ");

        if (evidence.length < 120) {
            await commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${evidence}`);
            return;
        }

        let memberTitle = authorId;
        if (member.nickname) memberTitle = `${member.nickname}_${authorId}`;

        const currentDate = new Date().toISOString();
        const evidenceFile = new MessageAttachment(Buffer.from(messageEvidence), `Evidence_against_${memberTitle}_on_${currentDate}}.txt`)
        const messagePreview = messageEvidence.substring(0, 25) + "...";

        const messageLogs = await commandsChannel.guild.channels.fetch(Properties.channels.messageLogs) as TextChannel;

        if (!messageLogs) {
            commandsChannel.send({
                files: [evidenceFile]
            }).then(message => {
                const attachment = message.attachments.first();
                if (attachment?.url) {
                    commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${messagePreview} Full Evidence: ${attachment.url}`)
                }
            }).catch(console.error);

            return;
        }

        messageLogs.send({
            files: [evidenceFile]
        }).then(message => {
            const attachment = message.attachments.first();
            if (attachment?.url) {
                commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${messagePreview} Full Evidence: ${attachment.url}`)
            }
        }).catch(console.error)
    }

    public static async purgeMessagesFromUserInChannel(channel: TextChannel, member: GuildMember, moderator: User) {
        const commandsChannel = await channel.guild.channels.fetch(Properties.channels.commands) as TextChannel;

        if (RoleUtils.hasAnyRole(member, [
            RoleUtils.roles.bot,
            RoleUtils.roles.moderator,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager
        ])) {
            await commandsChannel.send(`${moderator} Oops! You can't Sweep another moderator. (Nice try though)`);
            return;
        }

        let messagesToBePurged: Message[] = [];
        let evidence = "";
        let messageCount = 0;

        channel.messages.fetch({
            limit: 100,
        }).then(messages => {
            messages.forEach(message => {
                if (message.author.id == member.id) {
                    messagesToBePurged.push(message);
                    messageCount++;
                    evidence += `[${message.createdAt.getFullYear()}-${message.createdAt.getMonth() + 1}-${message.createdAt.getDate()}`
                        + `-${String(message.createdAt.getHours()).padStart(2, '0')}:${String(message.createdAt.getMinutes()).padStart(2, '0')}:${String(message.createdAt.getSeconds()).padStart(2, '0')}]`
                        + `(${member.id})`
                        + `-${message.content} \n`;
                }
            })
        }).then(async () => {
            if (messageCount == 0) return;
            channel.bulkDelete(messagesToBePurged).catch(console.error)

            const currentTime = new Date().toISOString();
            const evidenceFile = new MessageAttachment(Buffer.from(evidence), `Evidence_against_${member.id}_on_${currentTime}}.txt`);
            const messageLogs = await channel.guild.channels.fetch(Properties.channels.messageLogs) as TextChannel;


            messageLogs.send({
                files: [evidenceFile]
            }).then(message => {
                const attachment = message.attachments.first();
                if (attachment?.url) {
                    commandsChannel.send(`${moderator} - You swept messages by ${member} (${member.id})`
                        + `\n> <:sweep:${Properties.emojis.sweep}> ${messageCount} messages deleted in ${channel}`
                        + `\n\n**Message Evidence:** ${attachment.url}`)
                }
            }).catch(console.error);
        }).catch(console.error);
    }

    public static async quickMuteFromButton(interaction: ButtonInteraction, duration: string) {
        const modAlertMessage = interaction.message as Message;
        const authorId = modAlertMessage.content.split("`")[3];
        const channelId = modAlertMessage.content.split("/")[5];
        const messageId: string = modAlertMessage.content.split("/")[6].replace(/\D/g, '');

        const commandsChannel = await interaction.guild?.channels.fetch(Properties.channels.commands) as TextChannel;
        const originChannel = await interaction.guild?.channels.fetch(channelId) as TextChannel;
        const messageEvidence = ModAlert.existingModAlerts.get(messageId);

        originChannel.messages.fetch(messageId).then(message => {
            if (messageEvidence) {
                this.quickMuteUser(interaction.user, authorId, duration, messageEvidence, commandsChannel, message);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            } else {
                this.quickMuteUser(interaction.user, authorId, duration, message.content, commandsChannel, message);
                commandsChannel.send(`${interaction.user} Please verify the following Quick Mute. The message was not cached; it could have been edited.`);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            }
        }).catch(err => {
            if (messageEvidence) {
                this.quickMuteUser(interaction.user, authorId, duration, messageEvidence, commandsChannel, null);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            } else {
                console.log(ModAlert.existingModAlerts)
                console.error(err);

                commandsChannel.send(`${interaction.user} The message was deleted and not cached! Please mute manually`);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            }
        }).catch(console.error);
    }
}

